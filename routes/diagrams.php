<?php

use Slim\Http\Request;
use Slim\Http\Response;

$app->group('/diagrams', function () {

    $this->get('/top', function ($request, $response, $args) {

        return $this->renderer->render($response, 'diagram_top.phtml', $args);
    });

});
