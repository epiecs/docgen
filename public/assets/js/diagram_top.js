const markup = {
    'grid': {
        'offsetX' : 100,
        'offsetY' : 100,
        'width'   : 1800,
        'height'  : 900,
        'gridSize': 10
    },
    'racks'       : {
        'height'  : 20,
        'width'   : 20,
        'text'    : '#f0f0f0',
        'bg'      : '#444444',
        'edge'    : '#fe8550',
    },
    'tooltips'       : {
        'height'  : 20,
        'width'   : 100,
        'text'    : '#f0f0f0',
        'bg'      : '#444444',
        'edge'    : '#d62424',
    },
    'fibercount'  : {
        'text'    : '#f0f0f0',
        'bg'      : '#000000',
        'edge'    : '#228ff4',
    }
};

var racks = [];
var connections = [];
var rawRacks = [];
var rawConnections = [];

const allowedDirections = [
    'top', 'left', 'right', 'bottom', //'Topleft', 'Topright', 'Bottomleft', 'Bottomright'
];

var graph = new joint.dia.Graph();

var diagram = new joint.dia.Paper({
    el: document.getElementById('diagram'),
    width: markup.grid.width,
    height: markup.grid.height,
    gridSize: markup.grid.gridSize,
    model: graph,
    interactive: false,
    defaultRouter: {
        name: 'metro',
        args: {
            step: 5,
            // padding: 10,
            startDirections: allowedDirections,
            endDirections: allowedDirections,
            directionMap: {
                right: { x: 1, y: 0 },
                bottom: { x: 0, y: 1 },
                left: { x: -1, y: 0 },
                top: { x: 0, y: -1 },
                Topright:      {x: Math.SQRT2,  y: -Math.SQRT2},
                Bottomleft:    {x: -Math.SQRT2, y: Math.SQRT2},
                Topleft:       {x: -Math.SQRT2, y: -Math.SQRT2},
                Bottomright:   {x: Math.SQRT2,  y: Math.SQRT2}
            },
        }
    },
    defaultConnector : {
        name: 'jumpover',
        args: {
            size  : 3,
            jump: 'gap' //arc, cubic, gap
        }
    }
});

var svgZoom = svgPanZoom('#diagram svg', {
  center: false,
  zoomEnabled: true,
  panEnabled: true,
  controlIconsEnabled: true,
  fit: false,
  minZoom: 0.7,
  maxZoom:4,
  zoomScaleSensitivity: 0.5
});

function getSide(angle)
{
    // angles are not perfect but mostly offset by one for better looking results

    if(angle >= 45 && angle <= 135){
        return 'top';
    }
    else if(angle > 135 && angle <= 225) {
        return 'right';
    }
    else if(angle >= 226 && angle < 315) {
        return 'bottom';
    }
    else if(angle >= 315 && angle <= 366) {
        return 'left';
    }
    else if(angle >= 0 && angle < 45) {
        return 'left';
    }
}

function placeRack(name, rack)
{
    racks[name] = new joint.shapes.standard.Rectangle({
        position: { x: rack.x * 50, y: rack.y * 50 },
        size: { width: markup.racks.width, height: markup.racks.height },
        attrs: {
            body: {
                fill: markup.racks.bg,
                stroke: markup.racks.edge,
                strokeWidth: 1
            },
            label: {
                text: name,
                fill: markup.racks.text,
                fontSize: 5,
                fontWeight: 'bold',
                fontVariant: 'small-caps'
            }
        },
        description: rack.description,
        ports: {
            groups: {
                'top': {
                    position: {
                        name: 'top',
                        args: {},
                    }
                },
                'right': {
                    position: {
                        name: 'right',
                        args: {},
                    }
                },
                'left': {
                    position: {
                        name: 'left',
                        args: {},
                    }
                },
                'bottom': {
                    position: {
                        name: 'bottom',
                        args: {},
                    }
                },
            }
        }
    });

    graph.addCells([racks[name]]);
}

function connectRack(source, fibers)
{
    Object.entries(fibers).forEach((destinationData) => {
        const [destination, data] = destinationData;

        /*
        Calculate the angle between source and destination in both directions. This way we can kinda map the best side to add a port to source and destination

        \  |  /
        -     -
        /  |  \

        */

        var sourceAngle = Math.atan2(racks[destination].attributes.position.y - racks[source].attributes.position.y, racks[destination].attributes.position.x - racks[source].attributes.position.x) * 180 / Math.PI + 180
        var destinationAngle = Math.atan2(racks[source].attributes.position.y - racks[destination].attributes.position.y, racks[source].attributes.position.x - racks[destination].attributes.position.x) * 180 / Math.PI + 180

        let sourceSide = getSide(sourceAngle);
        let destinationSide = getSide(destinationAngle);

        racks[source].addPort({
            group: sourceSide,
            //markup: '<rect width="2" height="2" fill="red"/>'
            markup: '<rect width="0" height="0" fill="red"/>'

        });

        racks[destination].addPort({
            group: destinationSide,
            //markup: '<rect width="2" height="2" fill="blue"/>'
            markup: '<rect width="0" height="0" fill="blue"/>'
        });

        //console.log(sourcePort);
        let sourcePort = racks[source].attributes.ports.items[racks[source].attributes.ports.items.length - 1];
        let destinationPort = racks[destination].attributes.ports.items[racks[destination].attributes.ports.items.length - 1];

        connections[source] = new joint.shapes.standard.Link({
            source: {
                id: racks[source].id,
                port: sourcePort.id
            },
            target: {
                id: racks[destination].id,
                port: destinationPort.id
            },
            attrs: {
                line: {
                    stroke: '#333333',
                    strokeWidth: 1,
                    sourceMarker: { // hour hand
                        'type': 'path',
                        'd': '' // remove arrow head pointer
                    },
                    targetMarker: { // minute hand
                        'type': 'path',
                        'd': ''
                    }
                },
            }
        });

        connections[source].appendLabel({
            markup: [
                {
                    tagName : 'circle',
                    selector: 'body'
                },
                {
                    tagName : 'text',
                    selector: 'label'
                }
            ],
            attrs: {
                label: {
                    text         : `0/${data.fibers}`, // TODO: hier nog later adhv het aantal patchings zien wat vrij is op een fiber
                    fill         : markup.fibercount.text,
                    fontSize     : 4,
                    textAnchor   : 'middle',
                    yAlignment   : 'middle',
                    pointerEvents: 'none'
                },
                body: {
                    ref        : 'label',
                    fill       : markup.fibercount.bg,
                    stroke     : markup.fibercount.edge,
                    strokeWidth: 1,
                    refR       : 1,
                    refCx      : 0,
                    refCy      : 0
                },
            },
            position: {
                distance: 0.5
            }
        });

        connections[source].addTo(graph);
        connections[source].toBack();
    });
}

/*
    Request rack data
 */

const racksRequest = fetch(`${window.location.origin}/racks`).then(function(response){
         return response.json()
});

const connectionsRequest = fetch(`${window.location.origin}/connections`).then(function(response){
         return response.json()
});

Promise.all([racksRequest,connectionsRequest])
    .then(function(values) {
        rawRacks       = values[0];
        rawConnections = values[1];

        // Add racks to the diagram
        Object.entries(rawRacks).forEach((rack) => {
            const [name, data] = rack;
            placeRack(name, data);
        });

        // Add connections to the diagram
        Object.entries(rawConnections).forEach((connection) => {
            const [name, data] = connection;
            connectRack(name, data);
        });

        // Remove arrow pointers from links
    })
    .catch(function(error) {
        console.log(error);
    });

diagram.on('cell:mouseover', function(cellView) {

    if(cellView.model.attributes.type != 'standard.Link'){

        let xpos = cellView.model.attributes.position.x - (markup.tooltips.width / 2)  + (markup.racks.width / 2);
        let ypos = cellView.model.attributes.position.y + markup.racks.height + (markup.grid.gridSize / 2);

        let tooltip = new joint.shapes.standard.Rectangle({
            id: 'tooltip',
            position: { x: xpos, y: ypos},
            size: { width: markup.tooltips.width, height: markup.tooltips.height },
            attrs: {
                body: {
                    fill: markup.tooltips.bg,
                    stroke: markup.tooltips.edge,
                    strokeWidth: 1
                },
                label: {
                    text: cellView.model.attributes.description,
                    fill: markup.tooltips.text,
                    fontSize: 5,
                    fontWeight: 'bold',
                    fontVariant: 'small-caps'
                }
            },
        });

        graph.addCell(tooltip);
    }

});

diagram.on('cell:mouseleave', function(cellView) {
    if(cellView.model.attributes.type != 'standard.Link'){
        graph.getCell('tooltip').remove();
    }
});

diagram.on('cell:pointerdown', function(cellView) {

    diagram.findViewsInArea(diagram.getArea()).forEach(cellView => {
        cellView.unhighlight();
    });

    if(cellView.model.attributes.type == 'standard.Rectangle'){
        cellView.highlight();
    }

    graph.getLinks().forEach((link) => {
        link.attr("./display", "none");
    });

    graph.getConnectedLinks(cellView.model).forEach((link) => {
        link.attr("./display", "");
    });
});

diagram.on('blank:pointerdown', function() {

    diagram.findViewsInArea(diagram.getArea()).forEach(cellView => {
        cellView.unhighlight();
    });

    graph.getLinks().forEach((linkView) => {
        linkView.attr("./display", "");
    });
});

diagram.on('all', function(evt, x, y) {
    //console.log("All events", evt, x, y);
})
