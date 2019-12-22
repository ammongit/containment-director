// State variables
var context = {
  state: 'intro1',
  capital: 100,
  gotEnding: false,
  finished: 0,
  anomaly: null,
  costs: {
    records: 0,
    memories: 0,
  },
  agents: 0,
  info: 0,
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
    '<p>The currently active report, ' + anomaly.number + ', is bolded.',
    'We should send some field agents to the location.</p>',
  ]);

  updateActions();
  updateCapital();
}

function commandSecond() {
  context.state = 'command-second';

  setNotice([
    '<p>Now that we have personnel on-site, we should investigate.</p>',
  ]);
}

function commandThird() {
  context.state = 'command-third';

  setNotice([
    '<p>Your agents should have enough information now to attempt containment.</p>',
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

      html += ' ' + anomaly.tip + '.';

      return '<p>' + html + '</p>';
    });

  document.getElementById('reports').innerHTML = parts.join('');
}

function updateCosts(records, memories) {
  context.costs.records += records;
  context.costs.memories += memories;
}

function updateCapital(value = 0) {
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
  var parts = ACTIONS.map(function(action) {
    var visible = action.visible === undefined || action.visible();
    if (!visible) {
      return '';
    }

    var parts = [
      '<p>',
      action.description,
      '<span class="button-container">',
    ];

    action.buttons.forEach(function(button) {
      parts.push('<button onclick="');
      parts.push('updateCosts(' + action.costs.records + ', ' + action.costs.memories + ');');
      parts.push('updateCapital(-' + button.capitalCost + ');');
      parts.push(button.execute + ';');
      parts.push('updateActions();');
      parts.push('" ');

      var enabled = (
        action.enabled === undefined || (
          action.enabled() && button.capitalCost <= context.capital
        )
      );
      if (!enabled) {
        parts.push(' disabled');
      }

      parts.push('>');
      parts.push(button.label);
      parts.push('</button>');
    });

    parts.push('</span></p>');

    return parts.join('');
  });

  document.getElementById('actions').innerHTML = parts.join('');
}

function updateRecovery() {
  document.getElementById('recovery').innerHTML = recovery.join('<br>');
}

// Actions
function investigate() {
  if (context.anomaly.explained) {
    if (randRange(2)) {
      appendRecovery('Agents have determined that the phenomenon did not occur.');
    } else {
      appendRecovery('Agents have determined that the phenomenon did was mundane.');
    }

    document.getElementById('btn-dismiss').removeAttribute('disabled');
  } else if (context.info === 0) {
    if (context.anomaly.attributes.length === 0) {
      appendRecovery('Agents are determining the properties of the anomaly.');
    } else {
      var attr = randElement(context.anomaly.attributes);
      appendRecovery('Agents on-site report that ' + context.anomaly.number + ' is ' + ATTRIBUTES[attr] + '.');
    }
  }

  context.info++;

  if (context.state === 'command-second') {
    commandThird();
  }
}

function sendAgents(count) {
  var num = count === 2 ? 'Two' : 'Five';
  appendRecovery(num + ' field agents were dispatched to ' + context.anomaly.location + '.');

  context.agents += count;

  if (context.state === 'command-first') {
    commandSecond();
  }
}

function actionQuarantine() {
  appendRecovery('Agents have cordorned off an area around the anomaly.');
  context.attributes.add('quarantine');
}

function containRelocate() {
  appendRecovery('The anomaly has been contained and relocated.');
  document.getElementById('btn-designate').removeAttribute('disabled');
}

function containOnSite() {
  appendRecovery('A provisional containment area has been created at location.');
  document.getElementById('btn-designate').removeAttribute('disabled');
}

function actionAmnesticize() {
  appendRecovery('Witnesses in the area have been administered Class-A amnestics.');
}

function actionMisinfo() {
  appendRecovery('Misinformation Department workers have begun cover-up operations.');
}

function sendPi1() {
  appendRecovery('Mobile Task Force Pi-1 ("City Slickers") has been deployed to ' + context.anomaly.location + '.');

  context.agents += 8;
}

function designate() {
  appendRecovery(context.anomaly.number + ' has been preliminarily contained, and an SCP designation has been requested.');

  // TODO

  updateCapital(40);
  clearCurrentAnomaly();
}

function dismiss() {
  appendRecovery(context.anomaly.number + ' has been dismissed as resolved or non-anomalous.');

  updateCapital(40);
  clearCurrentAnomaly();
}

function clearCurrentAnomaly() {
  context.finished += 1;

  if (context.finished === 10) {
    setNotice([
      '<p>The Site Director has approved the deployment of MTF-Pi-1 ("City Slickers").</p>',
      '<p>They are often busy and should be used only when needed.</p>',
    ]);
  }

  var number = context.anomaly.number;
  delete anomalies[number];
  context.anomaly = null;
  context.costs = {
    waste: 0,
    memories: 0,
    records: 0,
  };
  context.agents = 0;
  context.info = 0;
  context.attributes.clear();

  if (!context.gotEnding) {
    if (context.finished > 50 || context.capital > 500) {
      document.getElementById('command').style = 'display: none';
      document.getElementById('finished').style = '';
      document.getElementById('finished-count').innerHTML = String(context.finished);
      context.gotEnding = true;
    }
  }

  document.getElementById('btn-designate').setAttribute('disabled', '');
  document.getElementById('btn-dismiss').setAttribute('disabled', '');
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
    name: 'investigate',
    description: 'Investigate',
    costs: {
      records: 0,
      memories: 2,
    },
    enabled: function() {
      return context.agents > 0;
    },
    buttons: [
      {
        label: '>',
        capitalCost: 2,
        execute: 'investigate()',
      },
    ],
  },
  {
    name: 'sendAgents',
    description: 'Send field agents',
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
    description: 'Quarantine the affected area',
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
    name: 'relocate',
    description: 'Relocate to Site-28',
    costs: {
      records: 0,
      memories: 5,
    },
    enabled: function() {
      return (
        context.info > 0 &&
        !context.anomaly.attributes.includes('immobile')
      );
    },
    buttons: [
      {
        label: '>>',
        capitalCost: 2,
        execute: 'containRelocate()',
      },
    ],
  },
  {
    name: 'contain',
    description: 'Contain on-site',
    costs: {
      records: 10,
      memories: 5,
    },
    enabled: function() {
      return (
        context.info > 0 &&
        context.anomaly.attributes.includes('immobile')
      );
    },
    buttons: [
      {
        label: '>>',
        capitalCost: 2,
        execute: 'containOnSite()',
      },
    ],
  },
  {
    name: 'amnesticize',
    description: 'Amnesticize affected civilians',
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
        label: '>>',
        capitalCost: 2,
        execute: 'actionAmnesticize()',
      },
    ],
  },
  {
    name: 'misinfo',
    description: 'Disseminate misinformation',
    costs: {
      records: -20,
      memories: -5,
    },
    enabled: function() {
      return context.agents > 0 && context.costs.records >= 5;
    },
    buttons: [
      {
        label: '>>',
        capitalCost: 2,
        execute: 'actionMisinfo()',
      },
    ],
  },
  {
    name: 'sendPi1',
    description: 'Send MTF-Pi-1 ("City Slickers")',
    costs: {
      records: 0,
      memories: 2,
    },
    visible: function() {
      return context.finished > 10;
    },
    buttons: [
      {
        label: '>>>',
        capitalCost: 25,
        execute: 'sendMtf()',
      },
    ],
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

var ATTRIBUTES = {
  animalistic: 'an anomalous animal',
  areWeCoolYet: 'tied to art collective AWCY?',
  artifact: 'a man-made artifact',
  artistic: 'an art piece',
  chaosInsurgency: 'the work of the Chaos Insurgency',
  ectoentropic: 'an ectoentropic anomaly',
  electrical: 'have electrical properties',
  hostile: 'is hostile towards personnel',
  humanoid: 'is humanoid',
  immobile: 'cannot be feasibly moved',
  marshallCarterAndDark: 'the property of Marshall, Carter, and Dark Ltd.',
  ontokinetic: 'a reality-bending anomaly',
  online: 'internet-based',
  sentient: 'sentient',
  serpentsHand: 'tied to the Serpent\'s Hand',
  thaumaturgic: 'thaumaturgic in nature',
  incorporeal: 'an incorporeal entity',
};

var BASE_ATTRIBUTE_ANOMALIES = [
  {
    hint: 'unusual blue slime is leaking',
    attributes: {
      artifact: 1,
      ectoentropic: 0.8,
      sentient: 0.2,
      humanoid: 0.2,
    },
  },
  {
    hint: 'a large thaumaturgic emission',
    origin: ORIGINS.sensors,
    attributes: {
      thaumaturgic: 1,
      artifact: 0.3,
      humanoid: 0.2,
      serpentsHand: 0.2,
      ectoentropic: 0.1,
      immobile: 0.1,
      hostile: 0.5,
    },
  },
  {
    hint: 'there is large-scale power outage',
    origin: ORIGINS.news,
    attributes: null,
  },
  {
    hint: 'unusual patterns in the electrical grid',
    attributes: {
      electrical: 0.8,
      sentient: 0.3,
      immobile: 0.1,
    },
  },
  {
    hint: 'unusual string of murders',
    origin: ORIGINS.police,
    attributes: {
      humanoid: 0.4,
      thaumaturgic: 0.3,
      ontokinetic: 0.1,
    },
  },
  {
    hint: 'activity from the Chaos Insurgency',
    attributes: null,
  },
  {
    hint: 'two-headed deer',
    attributes: {
      alive: 1,
      animalistic: 1,
      hostile: 0.4,
    },
  },
  {
    hint: 'seizures resulting from exposure to an internet video',
    attributes: {
      online: 1,
      cognitohazard: 0.9,
      electrical: 0.2,
      chaosInsurgency: 0.1,
    },
  },
  {
    hint: 'levitating arc of water',
    attributes: null,
  },
  {
    hint: 'graffiti materializing on building walls',
    attributes: {
      ectoentropic: 0.2,
      sentient: 0.4,
      hostile: 0.1,
    },
  },
  {
    hint: '"demonic sounds" coming from the streets',
    attributes: {
      sentient: 0.4,
      humanoid: 0.3,
      hostile: 0.8,
    },
  },
  {
    hint: 'sudden appearance of patches of flowers',
    attributes: {
      ontokinetic: 0.2,
      ectoentropic: 0.2,
    },
  },
  {
    hint: 'report bank accounts charging for "SUPERGUMP"',
    attributes: null,
  },
  {
    hint: 'stores selling products with the manufacturer "dado"',
    attributes: {
      artifact: 1,
    },
  },
  {
    hint: 'patterns similar to an anomalous narcotic',
    attributes: {
      cognitohazard: 1,
      artifact: 1,
    },
  },
  {
    hint: 'boiled eggs are appearing',
    attributes: null,
  },
  {
    hint: 'dancing glass dolls',
    attributes: {
      humanoid: 1,
      sentient: 0.3,
      hostile: 0.4,
    },
  },
  {
    hint: 'unusual sounds are heard',
    attributes: null,
  },
  {
    hint: 'a building is no longer perceptible',
    attributes: {
      immobile: 1,
      sentient: 0.1,
      marshallCarterAndDark: 0.2,
    },
  },
  {
    hint: 'levitating saucers',
    attributes: {
      incorporeal: 0.8,
      artifact: 0.2,
      humanoid: 0.2,
      sentient: 0.3,
    },
  },
];

shuffle(BASE_ATTRIBUTE_ANOMALIES);

function generateAnomaly() {
  var base = BASE_ATTRIBUTE_ANOMALIES[context.finished];
  if (base === undefined) {
    base = randElement(BASE_ATTRIBUTE_ANOMALIES);
  }

  var hint = base.hint;
  var origin = base.origin || null;
  var attributes = [];

  var explained = Math.random() < 0.1;
  if (!explained) {
    if (base.attributes === null) {
      // Add random attributes
      var lengthProbabilities = {
        0: 0.10,
        1: 0.08,
        2: 0.05,
        3: 0.03,
      };

      Object
        .keys(ATTRIBUTES)
        .forEach(function(attr) {
          var prob = lengthProbabilities[attributes.length] || 0.01;

          if (Math.random() < prob) {
            attributes.push(attr);
          }
        });
    } else {
      // Add attributes from base
      Object
        .entries(base.attributes)
        .forEach(function(entry) {
          var attr = entry[0];
          var prob = entry[1];

          if (Math.random() < prob) {
            attributes.push(attr);
          }
        });
    }
  }

  var number = generateItemNo();
  var location = randomLocation();

  var origin = generateOrigin(hint, location, origin);
  var anomaly = {
    number: number,
    location: location,
    tip: origin.tip,
    cleanup: origin.cleanup,
    attributes: attributes,
    explained: explained,
  };

  anomalies[number] = anomaly;
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
    randIdx = Math.floor(Math.random(), idx);
    idx--;

    temp = array[idx];
    array[idx] = array[randIdx];
    array[randIdx] = temp;
  }
}
