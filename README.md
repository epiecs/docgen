# Docgen

Docgen is a tool that allows you to declare fiber shelves and racks in a yaml file and uses that file to generate a fiber diagram.

More functionality tba.

## Getting up and running quickly

1. Rename the .example from each file in the data folder.
2. cd to the folder where you cloned this project
3. `php -S localhost:8080 -t public`
4. navigate to localhost:8080

## Features

- Click on a rack to show only connections leaving/connecting to this racks
- Data is rendered as svg for easy saving/redistribution
- Pan and zoomable

## How to define fiber racks and shelves/panels

![screen][screenshot]

[screenshot]: docs/fibermap.png "Example of fiber map"

For each rack you have to create a rack in the fiber.yml file. Each rack has a x and y coordinate for placing it on the grid.

The next step is to define a panel for each fiber shelf in the rack. In the example below there are 2 fiber shelves.

In the first panel we have 24 connectors (48 fiber strands) going to REMOTE_RACK_ID_1.

In the second panel we have 6 connectors going to REMOTE_RACK_ID_2, 6 connectors going to REMOTE_RACK_ID_3 and 12 connectors going to REMOTE_RACK_ID_4

For a working example please refer to the fiber.yml.example file. The example fiber.yml file renders the network shown in the first screenshot.

```yaml
racks:
    RACK_ID:
        x: (int) X coordinate
        y: (int) Y coordinate
        description: Description of rack
        panels:
            1:
                REMOTE_RACK_ID_1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
            2:
                REMOTE_RACK_ID_2: [1, 2, 3, 4, 5, 6]
                REMOTE_RACK_ID_3: [7, 8, 9, 10, 11, 12]
                REMOTE_RACK_ID_4: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]

```
