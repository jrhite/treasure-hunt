# Treasure Hunt

* [Introduction](#introduction)
* [Storage Layout](#storage-layout)
  * [Value and Reference Type Storage Variables](#value-and-reference-type-storage-variables)
  * [Value Type Variables](#value-type-variables)
  * [Arrays](#arrays)
  * [Mappings](#mappings)
* [Finding the Treasure](#finding-the-treasure)

## Introduction
Ahoy Mateys,

Blimey me! I hear ye be looking for unfound treasures in the deeps of the vast ocean of Solidity's treasure maps. Well, ye've come to the right place to begin the treasure hunt, ye budding Solidity pirates.

Most call me Captain Keccak, and avast ye, ye best call me that too! The last pirate who did not heed this, Captain Hook, lost his hand to a friend of mine. Savvy?

Excellent!

Let me be the first to welcome ye to the Treasure Hunt game. I, your trusted pirate captain, will be your guide along the way.

Solidity's treasure maps are vast. Indeed, these maps are larger than maps of all the stars in the observable universe. These maps are so large that only a few pirates have e'er uncovered even a single treasure hidden within them.

Ye, being a pirate and all, let me transate some pirate terminology to land lubber speak (also known as geek speak)...

Treasure Maps are written on scrolls of paper. In geek speak, you can think of a single scroll as a Solidity Contract. Treasure maps are written upon these scrolls. For treasure hunting purposes you can think of a treasure map as the Storage Layout of a Solidity Contract.

Each contract's Storage Layout has an astronomical amount of different locations where treasure hunt clues and/or treasures can be buried. I, Captain Keccak, am a pirate and am no mathematician nor writer to be sure. But let me share with ye budding pirates some things that one great sage once explained to me...

## Storage Layout
**A contract's storage layout contains 2^256 storage slots and each storage slot contains 32 bytes of data.**

_2^256 equates to 10^77 storage slots. Compare that to the number of stars in the observable universe which is estimated to be between 10^22 and 10^24 stars. Sink me! No wonder so few treasures have e'er been found._

The details of storage layout in Solidity can be found in the [Solidity Storage Layout Docs](https://docs.soliditylang.org/en/v0.8.13/internals/layout_in_storage.html) and it's definitely worth a read.

But to speed you along your way, this much can be said here...

When variables are declared in a smart contract, they are assigned a storage slot in the order in which they are declared. For example:

```solidity
contract CaptainHook {
  // storage slot 0x0
  uint256 private captainHooksAgeInYears = 320;

  // storage slot 0x1
  address[] private captainHooksCrewMemberAddresses;

  // storage slot 0x2
  mapping (address => uint256) private crewMemberNumberOfGoldCoins;

  // storage slot 0x3
  uint8 private captainHooksNumberOfHands = 1;    // byte-packed into slot 3
  uint8 private captainHooksNumberOfFriends = 0;  // byte-packed into slot 3

  // storage slot 0x4
  string private captainHooksFullName = "Captain James Bartholemew Hook";
}
```

### Value and Reference Type Storage Variables
In Solidity, there are generally 2 types of variables: **Value Types** and **Reference Types**. Value type variables are variables that have a fixed size at compile time and can never change. `uint256`, `int8`, and `bool` are just a few examples of a value type variable. Reference type variables have a dynamic size that can change over time. Dynamic arrays, `uint256[]` for exampe, and `mappings` are examples of reference type variables.

### Value Type Variables
When value type state variables are declared consecutively in a contract, if the variable types can be represented in 18 bytes or less, then Solidity will 'byte-pack' the variables into the same storage slot to save on storage space.

For example, in the CaptainHook contract above, 2 consecutive state variables type `uint8` are declared: `captainHooksNumberOfHands` and `captainHooksNumberOfFriends`. Because these variable takes only 1 byte to store (8 bits) and each storage slot can store up to 32 bytes, the Solidity Compiler and EVM will byte-pack these variables into the same storage slot.

Byte-packed values stored in the same storage slot will be stored from left-to-right in a storage slot. So because `captainHooksNumberOfHands` is declared first and `captainHooksNumberOfFriends` is declared second the data in storage slot 3 will be:

0x00000000...captainHooksNumberOfFriendscaptainHooksNumberOfHands

To read `captainHooksNumberOfFriends` from storage 3 not only does storage slot 3 need to be loaded, but then the value needs to be bit shifted by 1 byte to the right. Then to get the value other potentially packed variables need to be masked off (bitwise AND'ed with 0x3 padded to 32 bytes) giving us only the value of `captainHooksNumberOfFriends`. To read the value `captainHooksNumberOfHands` all other data than the first 8 bits need to be masked off (bitwise AND'ed with 0x3 padded to 32 bytes)

Whether state variables will be byte-packed depends on the types or order of the state variable. Byte-packing can be good for optimzing on storage gas costs, but reading a byte-packed values will cost extra gas when the values need to be read.

**For value types the storage slot of the variable contains the variable's value. It's as simple as that.**

For reference types the storage slot of the variable **does not** contain the variable's value. Rather the variable's storage slot is only a marker slot, marking the fact that the variable with the given name exists.

### Arrays
For array reference types the storage slot of the variable marks the array variable's existence. Additionally, the length of the array is also stored in the array's marker storage slot.

If an array's marker slot is storage slot `p`, then reading the value directly from the marker storage slot `p` will return the array's length. But the actual data of the array will be stored starting at storage slot `keccak256(p)`.

In the example contract above the array variable `captainHooksCrewMemberAddresses` marker slot is `0x1`. If we read the data from this storage slot, `0x1`, we will get the length of the array, but the actual data in the array begins at the keccak256 hash of the marker storage slot. In other words, reading from storage slot `keccak256(0x1)` would be the equivalent of reading the value `captainHooksCrewMemberAddresses[0]`.

To read an array element at index 1 of an array, for example to read `captainHooksCrewMemberAddresses[1]`, we would read from the storage slot `keccak256(0x1) + 1`, and so on...

Here is example JS code using 'ethers.js' that calculates the array's data storage slots for `captainHooksCrewMemberAddresses[0]` and `captainHooksCrewMemberAddresses[1]`:

```javascript
  const dataArrayIndex0StorageSlot = ethers.utils.keccak256(ethers.utils.hexZeroPad('0x1', 32));
  const dataArrayIndex1StorageSlot = ethers.BigNumber.from(dataArrayIndex0StorageSlot).add(1).toHexString();
```

### Mappings
For mapping reference types the storage slot of the variable marks the mapping variable's existence. For mappings, no additional information is stored in marker storage slot. For example, in the example contract above the mapping variable `crewMemberNumberOfGoldCoins` marker slot is `0x2`. If we read the data from this storage slot we will get `0`, unlike arrays where the array length is returned returned.

To get the actual data of the map values for given keys we need to use a combination of the map's marker slot `p` and a map key `k` that we want to get the value for.

The storage slot for key `k` would be `keccak256(h(k) . p)` where:
* `k` is the key into the mapping
* `h()` is a function that pads the value `k` to 32 bytes
* `p` is value of the marker storage slot
* `.` means to concatenate `h(k)` and `p`

If we have a crew member with address `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` and we want to find that crew member's number of gold coins, we first need to calculate the storage slot for this key in the `crewMemberNumberOfGoldCoins` mapping.

Solidity addresses are 20 bytes long and because the `crewMemberNumberOfGoldCoins` is a mapping that maps `address` keys to `uint256` values, to read value `crewMemberNumberOfGoldCoins[0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266]` the storage slot of this would be calculated as:

```
keccak256('0x000000000000000000000000f39Fd6e51aad88F6F4ce6aB8827279cffFb92266' + '0000000000000000000000000000000000000000000000000000000000000002')
```

From the example contract above the mapping variable `crewMemberNumberOfGoldCoins` marker slot is `0x2`. Using 'ethers.js' to calculate the storage slot 

```javascript
  // const dataArrayIndex0StorageSlot = utils.keccak256('0x1');
```

TODO - finish docs on mapping


## Finding the Treasure!

Read the clues from the treasure map (the storage slots of the `TreasureHunt.sol` contract). Here is the contract:

```solidity
contract TreasureHunt {
    // storage slot 0x0
    string private startHere;

    // storage slot 0x1
    mapping(bytes32 => string) private iceWallGuardTowers;

    // storage slot 0x2
    string[] private hallOfNumberedDoors;

    // storage slot 0x3
    uint8 private w;    // byte-packed into storage slot 3
    uint8 private x;    // byte-packed into storage slot 3
    uint8 private y;    // byte-packed into storage slot 3
}
```


TODO - finish docs on how to find the treasure

I've got this treasure map that details the clues of where a glorious treasure has been hidden in the Rinkeby sea. You can find this treasure map at: <contract_address>

I don't much about this map or its clues, but I can tell you this...

The code for the contract lies here ['./contracts/TreasureHunt.sol'](./contracts/TreasureHunt.sol). We can see all the names of all the clues we will need to read and follow to make our way, clue-by-clue, to arrive at the elusive treasure. Alas, the problem is that whoever hid this treasure made things quite tricky treasure hunters. All the clues are private. This means the only way we can find and read the clues is to calculate each clues storage position on our own.

The clues are ordered, with each clue leading to the next, until we find our way to the final clue which reveals the storage location of the treasure.


TODO - finish docs on how to find the treasure


The map ye've found here
is indeed a map to some great treasures, although so few have been
able to read this map. This map contains its clues to the treasure
in its different storage locations.
Welcome to the Treasure Hunt game! Here is how to play the game and find the treasure.

