<?php

use Slim\Http\Request;
use Slim\Http\Response;

use Symfony\Component\Yaml\Yaml;

$app->group('/racks', function () {

    $this->get('[/{id}]', function ($request, $response, $args) {

        $infrastructure = Yaml::parseFile($this->get('settings')['paths']['data'] . "fiber.yml");

        $rackFilter = [];

        if(isset($args['id']))
        {
            $rackFilter[] = $args['id'];

            foreach ($infrastructure['racks'][$args['id']]['panels'] as $panel) {
                foreach (array_keys($panel) as $id)
                {
                    if(!in_array($id, $rackFilter))
                    {
                        $rackFilter[] = $id;
                    }
                }
            }

            $infrastructure['racks'] = array_intersect_key($infrastructure['racks'], array_flip($rackFilter));
        }


        // Generate the list with connections, for every connection check if both points are
        // defined. if not we do not register the connection
        $connectorCount = array();

        foreach($infrastructure['racks'] as $location => $rack)
        {
            //loop all panels first and make a total count of all fibers
            foreach($rack['panels'] as $panel)
            {
                if(count($panel) > 0)
                {
                    foreach($panel as $panelLocation => $patchPoints)
                    {
                        $connectorCount[$location][$panelLocation] = isset($connectorCount[$location][$panelLocation]) ? $connectorCount[$location][$panelLocation] + count($patchPoints) : count($patchPoints);
                    }
                }
            }
        }

        // loop all connectors and build an array containing connections in one direction
        // direction doesnt matter as long as the count is accurate. This way we can build
        // our joints
        $connections = array();

        foreach($connectorCount as $sourceLocation => $connection)
        {
            foreach($connection as $destinationLocation => $connectors)
            {
                // only add the connection if it does not already exist in the other direction
                // only add the connection if the connection has both endpoints defined. since we
                // looped our yaml file we need only check if our location is defined in the yaml
                if(!isset($connections[$destinationLocation][$sourceLocation]) && isset($infrastructure['racks'][$destinationLocation]))
                {
                    $connections[$sourceLocation][$destinationLocation] = [
                        'fibers'      => $connectors * 2,
                        'connections' => $connectors,
                    ];
                }
            }
        }

        ksort($infrastructure['racks']);

        return $response->withJson($infrastructure['racks']);
    });

});
