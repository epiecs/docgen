# Fibermap

A quick and dirty tool to visualize fiber optic panels and connections

## Nice, but how does it work?

1. Easy, rename the .example from each file in the data folder.
2. cd to the folder where you cloned this project
3. `php -S localhost:8080 -t public`
4. navigate to localhost:8080/diagrams/top

An explanation how to use the yml file will come later. Basically a panel is a fiber panel. If a rack has 2 fiber shelves then that is 2 panels. Every number is a connector on that panel. the software expects every connector to be a duplex connector.
