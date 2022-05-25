const { keccak256 } = require('ethers/lib/utils');
const { ethers } = require('hardhat');
const { getStringAt } = require('./utils/solidity-string-utils');

const TREASURE_HUNT_ADDR = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

async function main() {
  // Let's start off and read the first clue of the treasure hunt. It's stored
  // in the `startHere` state variable of the TreasureHunt contract. Because
  // the `startHere` state variable is the first variable in the contract it
  // is conveniently located at storage variable 0.
  let clueStorageSlot = '0x0';
  let clue = await getStringAt(TREASURE_HUNT_ADDR, clueStorageSlot);
  console.log({ clue });

  //
  // Use the information in the clue to calculate the storage slot of the next
  // clue. When you have figured outt the next clue's location out read it and
  // continue on your way, clue after clue. Tack a steady course on your ship
  // and you eventually find your way to the glorious treasure that awaits you!
  //
  // TODO:
  //   1. clueStorageSlot = /* calculate next clue's storage slot */
  //   2. clue = await getStringAt(TREASURE_HUNT_ADDR, clueStorageSlot);
  //   3. console.log({ clue });
  //
  // Repeat the steps above until you've arrived at the treasure's location.

  const hallOfNumberedDoorsBaseSlot = ethers.utils.keccak256(
    ethers.utils.hexZeroPad('0x2', 32)
  );
  clueStorageSlot = ethers.BigNumber.from(hallOfNumberedDoorsBaseSlot)
    .add(2)
    .toHexString();
  clue = await getStringAt(TREASURE_HUNT_ADDR, clueStorageSlot);
  console.log({ clue });

  const the4thGuardedTowerKey = ethers.utils.hexZeroPad('0x4', 32);
  const the4thGuardedTowerMarkerSlot = ethers.utils.hexZeroPad('0x1', 32);
  clueStorageSlot = ethers.utils.keccak256(
    the4thGuardedTowerKey + the4thGuardedTowerMarkerSlot.slice(2)
  );

  clue = await getStringAt(TREASURE_HUNT_ADDR, clueStorageSlot);

  console.log({ clue });

  //
  // You've made it this far have ye! Very good matey...you're so very close.
  //
  // TODO: get the value of x
  //
  // To get the value of x:
  //   1. figure out which storage slot x lives in and read that slot
  //   2. figure out where in the storage slot x lives and use the necessary
  //      ethers.BigNumber operations to extract the value of x from the slot.
  //
  const storageSlotValueContainingX = ethers.BigNumber.from(
    await ethers.provider.getStorageAt(TREASURE_HUNT_ADDR, '0x3')
  );

  const x = storageSlotValueContainingX.shr(8).mask(8);

  await digUpTreasure(x);
}

async function digUpTreasure(x) {
  const treasureLocationStringForStorageSlot = `${x} marks the spot!`;

  console.log({ treasureLocationStringForStorageSlot });

  clueStorageSlot = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(treasureLocationStringForStorageSlot)
  );

  const treasure = await getStringAt(TREASURE_HUNT_ADDR, clueStorageSlot);

  console.log({ treasure });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
