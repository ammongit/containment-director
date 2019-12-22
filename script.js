// State variables
var context = {
  state: 'intro1',
  capital: 100,
  gotEnding: false,
  finished: 0,
  anomaly: null,
  costs: {
    waste: 0,
    memories: 0,
    records: 0,
  },
  agents: 0,
  attributes: new Set(),
};

var anomalies = {};
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
  var anomaly = generateAnomaly();

  setNotice([
    '<p>The currently active report, ' + anomaly.number + ', is bold.',
    'We should send some field agents to investigate.</p>',
  ]);
}

function continueFinished() {
  document.getElementById('finished').style = 'display: none';
  document.getElementById('command').style = '';
}

// Column state
function setNotice(parts) {
  document.getElementById('notice').innerHTML = parts.join(' ');
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

function updateCapital(value) {
  context.capital += value;

  document.getElementById('capital').innerHTML = String(context.capital);

  if (context.capital < 5) {
    document.getElementById('command').style = 'display: none';
    document.getElementById('fired').style = '';
    document.getElementById('fired-count').innerHTML = String(context.finished);
    context.gotEnding = true;
  }
}

function updateActions() {
  // TODO multiple calls
  var parts = ACTIONS.map(function(action) {
    var parts = [];

    action.buttons.forEach(function(button) {
      var html = '<button action="' + button.execute + '" ';
      var enabled = (
        action.enabled === undefined || (
          action.enabled() && button.capitalCost > context.capital
        )
      );

      if (!enabled) {
        html += ' disabled';
      }

      html += '>' + button.label + '</button>' + action.description;
      parts.push('<p>' + html + '</p>');
    });

    return ''.join(parts);
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

  updateCapital(40);
  clearCurrentAnomaly();
}

function dismiss() {
  appendRecovery(context.anomaly.item + ' has been dismissed as resolved or non-anomalous.');

  // TODO

  updateCapital(40);
  clearCurrentAnomaly();
}

function clearCurrentAnomaly() {
  context.finished += 1;

  var item = context.anomaly.item;
  delete anomalies[item];
  context.anomaly = null;
  context.costs = {
    waste: 0,
    memories: 0,
    records: 0,
  };
  context.agents = 0;
  context.attributes.clear();

  if (!context.gotEnding) {
    if (context.finished > 50 || context.capital > 500) {
      document.getElementById('command').style = 'display: none';
      document.getElementById('finished').style = '';
      document.getElementById('finished-count').innerHTML = String(context.finished);
      context.gotEnding = true;
    }
  }
}

function runAction(actionName) {
  var action = findAction(actionName);

  // TODO
}

function findAction(actionName) {
  for (var i = 0; i < ACTIONS.length; i++) {
    if (ACTIONS[i].name === actionName) {
      return ACTIONS[i];
    }
  }

  throw new Error('No action found with name: ' + actionName);
}

var ACTIONS = [
  {
    name: 'sendAgents',
    description: 'Send field agents.',
    costs: {
      records: 0,
      memories: 5,
    },
    buttons: [
      {
        label: '2',
        capitalCost: 2,
        execute: 'sendAgents(2)',
      },
      {
        label: '5',
        capitalCost: 5,
        execute: 'sendAgents(5)',
      },
    ],
  },
  {
    name: 'quarantine',
    description: 'Quarantine the affected area.',
    costs: {
      records: 5,
      memories: 15,
    },
    enabled: function() {
      return context.agents > 0 && !context.attributes.has('quarantine');
    },
    buttons: [
      {
        label: '>>',
        capitalCost: 2,
        execute: 'actionQuarantine()',
      },
    ],
  },
  {
    name: 'amnesticize',
    description: 'Amnesticize affected civilians.',
    functionName: 'actionAmnesticize',
    costs: {
      records: -5,
      memories: -20,
    },
    enabled: function() {
      return context.agents > 0 && context.costs.memories >= 5;
    },
    buttons: [
      {
        label: '',
        capitalCost: 2,
        execute: 'actionAmnesticize()',
      },
    ],
  },
  {
    name: 'misinfo',
    description: 'Disseminate misinformation.',
    costs: {
      records: -20,
      memories: -5,
    },
    enabled: function() {
      return context.agents > 0 && context.costs.records >= 5;
    },
    buttons: [
      {
        label: '',
        capitalCost: 2,
        execute: 'actionMisinfo()',
      },
    ],
  },
  {
    name: 'sendPi1',
    description: 'Send MTF-Pi-1 ("City Slickers"). Specializes in urban operations.',
    costs: {
      records: 0,
      memories: 2,
    },
    enabled: function() {
      return context.finished > 10;
    },
  },
];

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

var BASE_ATTRIBUTE_ANOMALIES = [
  {
    occurrence: '',
    attributes: {
    },
  },
];

shuffle(BASE_ATTRIBUTE_ANOMALIES);

function generateAnomaly() {
  var base = randElement(BASE_ATTRIBUTE_ANOMALIES);
  var occurrence = base.occurrence;
  var origin = base.origin || null;
  var attributes = [];

  Object
    .entries(base.attributes)
    .forEach(function(entry) {
      var attr = entry[0];
      var prob = entry[1];

      if (Math.random() < prob) {
        attributes.push(attr);
      }
    });

  var item = generateItemNo();
  var location = randomLocation();

  var origin = generateOrigin(occurrence, location, origin);
  var anomaly = {
    number: item,
    location: location,
    tip: origin.tip,
    cleanup: origin.cleanup,
  };

  anomalies[item] = anomaly;
  context.anomaly = anomaly;
  Object.assign(context.costs, anomaly.cleanup);
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

function shuffle(array) {
  var idx = array.length;
  var temp, randIdx;

  while (0 !== idx) {
    randIdx = Math.floor(Maht.random() idx);
    idx--;

    temp = array[idx];
    array[idx] = array[randIdx];
    array[randIdx] = temp;
  }
}
