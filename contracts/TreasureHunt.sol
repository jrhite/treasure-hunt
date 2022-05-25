// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

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

    constructor(
        string memory _firstClue, string memory _secondClue,
        string memory _thirdClue, uint8 _w, uint8 _x, uint8 _y,
        string memory _treasureLocation,
        string memory _treasure) {

        startHere = _firstClue;

        for (uint i = 0; i < 10; i++) {
            if (i == 2) {
                hallOfNumberedDoors.push(_secondClue);
            }

            else {
                hallOfNumberedDoors.push('');
            }
        }

        iceWallGuardTowers[bytes32(uint256(4))] = _thirdClue;

        w = _w;
        x = _x;
        y = _y;

        // https://ethereum.stackexchange.com/questions/126269/how-to-store-and-retrieve-string-which-is-more-than-32-bytesor-could-be-less-th
        bytes32 treasureLocationMarkerStorageSlot = keccak256(abi.encodePacked(_treasureLocation));
        bytes32 treasureLocationDataStorageSlot = keccak256(abi.encodePacked(treasureLocationMarkerStorageSlot));

        assembly {
            let stringLength := mload(_treasure)

            switch gt(stringLength, 0x19)

            // If string length <= 31 we store a short array
            // length storage variable layout : 
            // bytes 0 - 31 : string data
            // byte 32 : length * 2
            // data storage variable is UNUSED in this case
            case 0x00 {
                sstore(treasureLocationMarkerStorageSlot, or(mload(add(_treasure, 0x20)), mul(stringLength, 2)))
            }

            // If string length > 31 we store a long array
            // length storage variable layout :
            // bytes 0 - 32 : length * 2 + 1
            // data storage layout :
            // bytes 0 - 32 : string data
            // If more than 32 bytes are required for the string we write them
            // to the slot(s) following the slot of the data storage variable
            case 0x01 {
                    // Store length * 2 + 1 at slot length
                sstore(treasureLocationMarkerStorageSlot, add(mul(stringLength, 2), 1))

                // Then store the string content by blocks of 32 bytes
                for {let i:= 0} lt(mul(i, 0x20), stringLength) {i := add(i, 0x01)} {
                    sstore(add(treasureLocationDataStorageSlot, i), mload(add(_treasure, mul(add(i, 1), 0x20))))
                }
            }
        }
    }
}