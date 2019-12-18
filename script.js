// State variables
var context = {
  state: 'intro1',
  anomaly: null,
};

var anomalies = {};
var actions = [];
var recovery = [];

// States or actions
function intro2() {
  context.state = 'intro2';
  document.getElementById('intro1').style = 'display: none';
  document.getElementById('intro2').style = '';
}

function commandFirst() {
  context.state = 'command-first';
  document.getElementById('intro2').style = 'display: none';
  document.getElementById('command').style = '';

  // Generate first anomaly
  var anomaly = generateAnomaly(
    PREMADE_ANOMALY_ATTRIBUTES.first,
    'leaking blue slime',
    ORIGINS.eyewitness,
  );

  // TODO set actions

  setNotice([
    '<p>The currently active report, ' + anomaly.number + ', is bold.',
    'We should send some field agents to investigate.</p>',
  ]);

  setAvailableActions(1);
}

// Column state
function setNotice(parts) {
  document.getElementById('notice').innerHTML = parts.join(' ');
}

function addAction(action) {
  actions.push(action);
  updateActions();
}

function appendRecovery(entry) {
  recovery.push(entry);

  if (recovery.length >= 20) {
    recovery.shift();
  }

  updateRecovery();
}

// DOM
function updateReports() {
  var parts = Object
    .values(anomalies)
    .map(function(anomaly) {
      var html = '[' + anomaly.number + ']';

      if (anomaly.number === context.anomaly.number) {
        html = '<b>' + html + '</b>';
      }

      html += ' ' + anomaly.tip;

      return '<p>' + html + '</p>';
    });

  document.getElementById('reports').innerHTML = parts.join('');
}

function updateActions() {
  var parts = actions.map(function(action) {
    var html = '<button action=';
    html += '"' + action.functionName + '"';

    if (!action.enabled) {
      html += ' disabled';
    }

    html += '>Order</button>' + action.description;

    return '<p>' + html + '</p>';
  });

  document.getElementById('actions').innerHTML = parts.join('');
}

function updateRecovery() {
  document.getElementById('recovery').innerHTML = recovery.join('<br>');
}

// Actions
function designate() {
  appendRecovery(context.anomaly.item + ' has been preliminarily contained, and an SCP designation has been requested.');

  // TODO

  clearCurrentAnomaly();
}

function dismiss() {
  appendRecovery(context.anomaly.item + ' has been dismissed as resolved or non-anomalous.');

  // TODO

  clearCurrentAnomaly();
}

function clearCurrentAnomaly() {
  var item = context.anomaly.item;
  delete anomalies[item];
  context.anomaly = null;
}

var ACTIONS = [
  {
    name: 'sendAgents',
    description: 'Send field agents.',
    costs: {
      site: 5,
      records: 0,
      memories: 5,
    },
    attributes: [
      'agents',
      'personnel',
    ],
  },
  {
    name: 'sendDclass',
    description: 'Send D-class personnel.',
    costs: {
      site: 10,
      records: 0,
      memories: 10,
    },
    attributes: [
      'd-class',
      'personnel',
    ],
  },
  {
    name: 'interrogate',
    description: 'Interrogate civilians.',
    costs: {
      site: 0,
      records: 0,
      memories: 2,
    },
    attributes: [
      'requiresPersonnel',
      'gatherInfo',
    ],
  },
  {
    name: 'quarantine',
    description: 'Quarantine the affected area.',
    costs: {
      site: 10,
      records: 5,
      memories: 15,
    },
    attributes: [
      'requiresPersonnel',
      'quarantine',
    ],
  },
  {
    name: 'amnesticize',
    description: 'Amnesticize affected civilians.',
    functionName: 'actionAmnesticize',
    costs: {
      site: 10,
      records: -5,
      memories: -20,
    },
    attributes: [
      'requiresPersonnel',
      'amnestics',
    ],
  },
  {
    name: 'misinfo',
    description: 'Disseminate misinformation.',
    costs: {
      site: 10,
      records: -20,
      memories: -5,
    },
    attributes: [
      'requiresPersonnel',
      'misinfo',
    ],
  },
  {
    name: 'sendPi1',
    description: 'Send MTF-Pi-1 ("City Slickers"). Specializes in urban operations.',
    costs: {
      site: 20,
      records: 0,
      memories: 2,
    },
    attributes: [
      'taskForce',
      'agents',
      'personnel',
    ],
  },
  {
    name: 'sendGamma5',
    description: 'Send MTF-Gamma-5 ("Red Herrings"). Specializes in public misinformation and amnestic operations.',
    costs: {
      site: 25,
      records: -100,
      memories: -100,
    },
    attributes: [
      'taskForce',
      'agents',
      'personnel',
      'amnestics',
      'misinfo',
    ],
  },
];

function setAvailableActions(level, disabled = []) {
  actions = ACTIONS.slice(0, level);
  actions.forEach(function(action) {
    action.enabled = !disabled.includes(action.name);
  });

  updateActions();
}

// Anomalies
var STREETS = [
  'York Avenue',
  'First Avenue',
  'Second Avenue',
  'Third Avenue',
  'Lexington Avenue',
  'Madison Avenue',
  'Park Avenue',
  'Fifth Avenue',
  'Sixth Avenue',
  'Seventh Avenue',
  'Central Park West',
  'Columbus Avenue',
  'Amsterdam Avenue',
  'West End Avenue',
  'West Broadway',
  'Broadway',
  'Allen Street',
  'Astor Place',
  'Beach Street',
  'Bleecker Street',
  'Broome Street',
  'Columbus Circle',
  'Cortlandt Street',
  'Delancey Street',
  'Fulton Street',
  'Nassau Street',
  'Rutgers Street',
  'Sullivan Street',
  'Thompson Street',
  'Vesey Street',
  'Wooster Street',
  'Clark Street',
  'DeKalb Avenue',
  'Vanderbilt Avenue',
  'Roosevelent Avenue',
  'Albany Street',
  'Bowery',
  'Canal Street',
  'Chambers Street',
  'Cherry Street',
  'Christopher Street',
  'Franklin Street',
  'Gold Street',
  'Houston Street',
  'Hudson Street',
  'John Street',
  'Lafayette Street',
  'Pearl Street',
  'Wall Street',
  'Water Street',
  'Worth Street',
];

var PLACES = [
  'Albee Square',
  'Chatham Square',
  'Duffy Square',
  'Hanover Square',
  'Herald Square',
  'Lincoln Square',
  'Madison Square Garden',
  'Times Square',
  'Tompkins Square Park',
  'Verdi Square',
  'Washington Square Park',
  'Worth Square',
  'Governor\'s Island',
  'Liberty Island',
  'Roosevelt Island',
  'Central Park',
  'Prospect Park',
  'known entrance to the Wanderer\'s Library',
];

function randomLocation() {
  if (Math.random() < 0.1) {
    return randElement(PLACES);
  }

  var street;
  if (Math.random() < 0.4) {
    // Named street
    street = randElement(STREETS);
  } else {
    // Numbered street, with E/W
    var number = randRange(1, 200);
    var suffix = numericSuffix(number);
    if (number < 110) {
      var direction = randRange(2) ? 'West' : 'East';
      number = direction + ' ' + number;
    }
    street = number + suffix + ' Street';
  }

  return randRange(1, 1700) + ' ' + street;
}

var PREMADE_ANOMALY_ATTRIBUTES = {
  first: {
    'artifact': 1,
    'ectoentropic': 1,
    'indestructible': 0.2,
  },
};

var ANOMALY_ATTRIBUTES = [
  'artifact',
  'cognitohazard',
  'compulsion',
  'compulsion',
  'ectoentropic',
  'extradimensional',
  'humanoid',
  'immobile',
  'indestrubile',
  'mechanical',
  'non-euclidean',
  'ontokinetic',
  'psychic',
  'sapient',
  'sarkic',
  'spectral',
  'teleportation',
  'thaumaturgic',
];

function generateAnomaly(attributeProbabilities, occurrence, origin = null) {
  var item = generateItemNo();
  var location = randomLocation();
  var attributes = [];

  Object
    .entries(attributeProbabilities)
    .forEach(function(entry) {
      var attr = entry[0];
      var prob = entry[1];

      if (Math.random() < prob) {
        attributes.push(attr);
      }
    });

  var origin = generateOrigin(occurrence, location, origin);
  var anomaly = {
    number: item,
    location: location,
    tip: origin.tip,
    cleanup: origin.cleanup,
    attributes: attributes,
  };

  anomalies[item] = anomaly;
  context.anomaly = anomaly;
  updateReports();
  return anomaly;
}

function generateItemNo() {
  var number;

  do {
    number = 'PAR-' + randRange(10000, 99999);
  } while(anomalies[number] !== undefined);

  return number;
}

var ORIGINS = {
  rumors: {
    tip: 'Rumors are circulating of %OCCURRENCE% near %LOCATION%',
    cleanup: {
      waste: [0, 30],
      records: [0, 15],
      memories: [2, 12],
    },
  },
  eyewitness: {
    tip: 'Eyewitnesses report %OCCURRENCE% nearby %LOCATION%',
    cleanup: {
      waste: [0, 30],
      records: [0, 20],
      memories: [4, 16],
    },
  },
  socialMedia: {
    tip: 'Social media reports suggest %OCCURRENCE% at %LOCATION%',
    cleanup: {
      waste: [0, 30],
      records: [10, 40],
      memories: [8, 25],
    },
  },
  police: {
    tip: 'Police communications suggest %OCCURRENCE% at %LOCATION%',
    cleanup: {
      waste: [0, 30],
      records: [5, 10],
      memories: [4, 12],
    },
  },
  news: {
    tip: 'Local news report says %OCCURRENCE% nearby %LOCATION%',
    cleanup: {
      waste: [10, 30],
      records: [15, 40],
      memories: [20, 50],
    },
  },
  sensors: {
    tip: 'Foundation sensors detect %OCCURRENCE% around the area of %LOCATION%',
    cleanup: {
      waste: [20, 60],
      records: [0, 20],
      memories: [0, 20],
    },
  },
  surveillance: {
    tip: 'Foundation surveillance detects %OCCURRENCE% around the area of %LOCATION%',
    cleanup: {
      waste: [0, 60],
      records: [0, 40],
      memories: [0, 40],
    },
  },
};

function generateOrigin(occurrence, location, origin = null) {
  if (origin === null) {
    origin = randElement(Object.values(ORIGINS));
  }

  var tip = origin.tip
    .replace('%OCCURRENCE%', occurrence)
    .replace('%LOCATION%', location);

  var cleanup = {};
  Object
    .entries(origin.cleanup)
    .forEach(function(entry) {
      var key = entry[0];
      var minBound = entry[1][0];
      var maxBound = entry[1][1];

      cleanup[key] = randRange(minBound, maxBound);
    });

  return {
    tip: tip,
    cleanup: cleanup,
  };
}

// Helpers
function numericSuffix(number) {
  switch (number % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    default:
      return 'th';
  }
}

function randRange(a, b = null) {
  var upper, lower;
  if (b === null) {
    upper = a;
    lower = 0;
  } else {
    upper = b;
    lower = a;
  }

  return Math.floor(Math.random() * (upper - lower)) + lower;
}

function randElement(array) {
  return array[randRange(array.length)];
}
