const clues = [
  'Shiver me timbers! You are well on your way. Venture further to the Hall of Numbered Doors. The next clue will be found behind a door with a number less than 10 and rhymes with blue.',
  'Blimey...you may very well beat me on your quest for the treasure. Look next to the guard towers of the Ice Wall. In the 4th tower you will find what you what you seek.',
  'Well, well, you have not much further to go. \'x\' marks the spot of any true treasure. Delay not and find \'x\' now! All treasures are buried under the \'x]\'. Once you know \'x\', '
];

const w = 108;
const x = 33;
const y = 47;

const treasureLocation = `${x} marks the spot! Well blow me Captain Keccak down. I didn't think ye'd make it this far. `;
const treasure = ` Blow Captain Keccak down! I did't you'd make it this far. Your mastery of storage layout in Solidity is the best treasure of all! Congratulations!`;

module.exports = [
  clues[0],
  clues[1],
  clues[2],
  w,
  x,
  y,
  treasureLocation,
  treasure
];
