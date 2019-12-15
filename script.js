// Transitions
function intro2() {
  document.getElementById('intro1').style = 'display: none';
  document.getElementById('intro2').style = '';
}

function intro3() {
  document.getElementById('intro2').style = 'display: none';
  // TODO
document.getElementById('command').style = '';
}

var logEntries = [];

function appendLog(entry) {
  logEntries.push(entry);
  if (logEntries.length > 14) {
    logEntries.shift();
  }

  document.getElementById('log').innerHTML = logEntries.join('<br>');
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
];

function randomAddress() {
  if (Math.random() < 0.1) {
    return randElement(PLACES);
  }

  var street;
  if (Math.random() < 0.4) {
    // Named street
    street = randElement(STREETS);
  } else {
    // Numbered street, with E/W
    var number = randRange(200, 1);
    if (number < 110) {
      var direction = randRange(1) ? 'West' : 'East';
      number = direction + ' ' + number;
    }
    street = number + numericSuffix(number) + ' Street';
  }

  return randRange(3000, 1) + ' ' + street;
}

var ANOMALY_TYPES = [
  'artifact',
  'cognitohazard',
  'humanoid',
  'mechanical',
  'ontokinetic',
  'sarkic',
  'spectral',
  'thaumaturgic',
];

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

function randRange(upper, lower = 0) {
  return Math.floor(Math.random() * (upper - lower)) + lower;
}

function randElement(array) {
  return array[randRange(array.length)];
}
