
const TreasureHuntArgs = require('./utils/treasure-hunt-args.js');

async function main() {
  const TreasureHunt = await ethers.getContractFactory('TreasureHunt');
  const treasureHunt = await TreasureHunt.deploy(
    TreasureHuntArgs[0],
    TreasureHuntArgs[1],
    TreasureHuntArgs[2],
    TreasureHuntArgs[3],
    TreasureHuntArgs[4],
    TreasureHuntArgs[5],
    TreasureHuntArgs[6],
    TreasureHuntArgs[7]
  );

  await treasureHunt.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });