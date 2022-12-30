const button = {
    "abi": [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "pusher",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "pushes",
            "type": "uint256"
          }
        ],
        "name": "ButtonPushed",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "pushButton",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pushes",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": {
      "object": "0x608060405234801561001057600080fd5b50610106806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80630a00797214603757806331b982e914603f575b600080fd5b603d6059565b005b604760005481565b60405190815260200160405180910390f35b60008054908060668360aa565b90915550506000546040805133815260208101929092527fe5b191d26c3c0fe400f8aeb9867a526f00cb8f56584918c0a57428ad8dd5d7a0910160405180910390a1565b60006001820160c957634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220f46780b2422ed3eb6acb0f8b4a82c769d8378be3ed7f6d2b46c69db994e9f48264736f6c634300080d0033",
      "sourceMap": "25:218:36:-:0;;;;;;;;;;;;;;;;;;;",
      "linkReferences": {}
    },
    "deployedBytecode": {
      "object": "0x6080604052348015600f57600080fd5b506004361060325760003560e01c80630a00797214603757806331b982e914603f575b600080fd5b603d6059565b005b604760005481565b60405190815260200160405180910390f35b60008054908060668360aa565b90915550506000546040805133815260208101929092527fe5b191d26c3c0fe400f8aeb9867a526f00cb8f56584918c0a57428ad8dd5d7a0910160405180910390a1565b60006001820160c957634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220f46780b2422ed3eb6acb0f8b4a82c769d8378be3ed7f6d2b46c69db994e9f48264736f6c634300080d0033",
      "sourceMap": "25:218:36:-:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;140:101;;;:::i;:::-;;108:21;;;;;;;;;160:25:41;;;148:2;133:18;108:21:36;;;;;;;140:101;179:6;:8;;;:6;:8;;;:::i;:::-;;;;-1:-1:-1;;227:6:36;;202:32;;;215:10;607:51:41;;689:2;674:18;;667:34;;;;202:32:36;;580:18:41;202:32:36;;;;;;;140:101::o;196:232:41:-;235:3;256:17;;;253:140;;315:10;310:3;306:20;303:1;296:31;350:4;347:1;340:15;378:4;375:1;368:15;253:140;-1:-1:-1;420:1:41;409:13;;196:232::o",
      "linkReferences": {}
    },
    "methodIdentifiers": {
      "pushButton()": "0a007972",
      "pushes()": "31b982e9"
    },
    "rawMetadata": "{\"compiler\":{\"version\":\"0.8.13+commit.abaa5c0e\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"pusher\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"pushes\",\"type\":\"uint256\"}],\"name\":\"ButtonPushed\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"pushButton\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"pushes\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"kind\":\"dev\",\"methods\":{},\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{},\"version\":1}},\"settings\":{\"compilationTarget\":{\"src/Button.sol\":\"Button\"},\"evmVersion\":\"london\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\"},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[\":@gnosis.pm/=node_modules/@gnosis.pm/\",\":@gnosis.pm/safe-contracts/=lib/safe-contracts/\",\":@openzeppelin/=node_modules/@openzeppelin/\",\":@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/\",\":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/\",\":@semaphore-protocol/=lib/semaphore/packages/contracts/\",\":@semaphore-protocol/=node_modules/@semaphore-protocol/\",\":@zk-kit/=node_modules/@zk-kit/\",\":@zk-kit/incremental-merkle-tree.sol/=lib/zk-kit/packages/incremental-merkle-tree.sol/contracts/\",\":ds-test/=lib/forge-std/lib/ds-test/src/\",\":eth-gas-reporter/=node_modules/eth-gas-reporter/\",\":forge-std/=lib/forge-std/src/\",\":hardhat/=node_modules/hardhat/\",\":openzeppelin-contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/\",\":openzeppelin-contracts/=lib/openzeppelin-contracts/contracts/\",\":safe-contracts/=lib/safe-contracts/contracts/\",\":semaphore/=lib/semaphore/\",\":solmate/=lib/solmate/src/\",\":zk-kit/=lib/zk-kit/\",\":zodiac/=lib/zodiac/contracts/\"]},\"sources\":{\"src/Button.sol\":{\"keccak256\":\"0x42bb4bdeeaec3e68c1ba965738c71840f1f38b892d6768826c3114089c30b67c\",\"urls\":[\"bzz-raw://b804714ad4c460448bb80d04da370577738f8e16df4c8c73dc689647b411e422\",\"dweb:/ipfs/QmUTaChMaSJpavKizPU9fW3dbS89uc8NdsibDtJ3gD2YTs\"]}},\"version\":1}",
    "metadata": {
      "compiler": {
        "version": "0.8.13+commit.abaa5c0e"
      },
      "language": "Solidity",
      "output": {
        "abi": [
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "pusher",
                "type": "address",
                "indexed": false
              },
              {
                "internalType": "uint256",
                "name": "pushes",
                "type": "uint256",
                "indexed": false
              }
            ],
            "type": "event",
            "name": "ButtonPushed",
            "anonymous": false
          },
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
            "name": "pushButton"
          },
          {
            "inputs": [],
            "stateMutability": "view",
            "type": "function",
            "name": "pushes",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ]
          }
        ],
        "devdoc": {
          "kind": "dev",
          "methods": {},
          "version": 1
        },
        "userdoc": {
          "kind": "user",
          "methods": {},
          "version": 1
        }
      },
      "settings": {
        "remappings": [
          ":@gnosis.pm/=node_modules/@gnosis.pm/",
          ":@gnosis.pm/safe-contracts/=lib/safe-contracts/",
          ":@openzeppelin/=node_modules/@openzeppelin/",
          ":@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/",
          ":@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",
          ":@semaphore-protocol/=lib/semaphore/packages/contracts/",
          ":@semaphore-protocol/=node_modules/@semaphore-protocol/",
          ":@zk-kit/=node_modules/@zk-kit/",
          ":@zk-kit/incremental-merkle-tree.sol/=lib/zk-kit/packages/incremental-merkle-tree.sol/contracts/",
          ":ds-test/=lib/forge-std/lib/ds-test/src/",
          ":eth-gas-reporter/=node_modules/eth-gas-reporter/",
          ":forge-std/=lib/forge-std/src/",
          ":hardhat/=node_modules/hardhat/",
          ":openzeppelin-contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/",
          ":openzeppelin-contracts/=lib/openzeppelin-contracts/contracts/",
          ":safe-contracts/=lib/safe-contracts/contracts/",
          ":semaphore/=lib/semaphore/",
          ":solmate/=lib/solmate/src/",
          ":zk-kit/=lib/zk-kit/",
          ":zodiac/=lib/zodiac/contracts/"
        ],
        "optimizer": {
          "enabled": true,
          "runs": 200
        },
        "metadata": {
          "bytecodeHash": "ipfs"
        },
        "compilationTarget": {
          "src/Button.sol": "Button"
        },
        "libraries": {}
      },
      "sources": {
        "src/Button.sol": {
          "keccak256": "0x42bb4bdeeaec3e68c1ba965738c71840f1f38b892d6768826c3114089c30b67c",
          "urls": [
            "bzz-raw://b804714ad4c460448bb80d04da370577738f8e16df4c8c73dc689647b411e422",
            "dweb:/ipfs/QmUTaChMaSJpavKizPU9fW3dbS89uc8NdsibDtJ3gD2YTs"
          ],
          "license": null
        }
      },
      "version": 1
    },
    "ast": {
      "absolutePath": "src/Button.sol",
      "id": 27168,
      "exportedSymbols": {
        "Button": [
          27167
        ]
      },
      "nodeType": "SourceUnit",
      "src": "0:243:36",
      "nodes": [
        {
          "id": 27145,
          "nodeType": "PragmaDirective",
          "src": "0:23:36",
          "nodes": [],
          "literals": [
            "solidity",
            "^",
            "0.8",
            ".6"
          ]
        },
        {
          "id": 27167,
          "nodeType": "ContractDefinition",
          "src": "25:218:36",
          "nodes": [
            {
              "id": 27151,
              "nodeType": "EventDefinition",
              "src": "47:51:36",
              "nodes": [],
              "anonymous": false,
              "eventSelector": "e5b191d26c3c0fe400f8aeb9867a526f00cb8f56584918c0a57428ad8dd5d7a0",
              "name": "ButtonPushed",
              "nameLocation": "53:12:36",
              "parameters": {
                "id": 27150,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 27147,
                    "indexed": false,
                    "mutability": "mutable",
                    "name": "pusher",
                    "nameLocation": "74:6:36",
                    "nodeType": "VariableDeclaration",
                    "scope": 27151,
                    "src": "66:14:36",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 27146,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "66:7:36",
                      "stateMutability": "nonpayable",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 27149,
                    "indexed": false,
                    "mutability": "mutable",
                    "name": "pushes",
                    "nameLocation": "90:6:36",
                    "nodeType": "VariableDeclaration",
                    "scope": 27151,
                    "src": "82:14:36",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    },
                    "typeName": {
                      "id": 27148,
                      "name": "uint256",
                      "nodeType": "ElementaryTypeName",
                      "src": "82:7:36",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      }
                    },
                    "visibility": "internal"
                  }
                ],
                "src": "65:32:36"
              }
            },
            {
              "id": 27153,
              "nodeType": "VariableDeclaration",
              "src": "108:21:36",
              "nodes": [],
              "constant": false,
              "functionSelector": "31b982e9",
              "mutability": "mutable",
              "name": "pushes",
              "nameLocation": "123:6:36",
              "scope": 27167,
              "stateVariable": true,
              "storageLocation": "default",
              "typeDescriptions": {
                "typeIdentifier": "t_uint256",
                "typeString": "uint256"
              },
              "typeName": {
                "id": 27152,
                "name": "uint256",
                "nodeType": "ElementaryTypeName",
                "src": "108:7:36",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                }
              },
              "visibility": "public"
            },
            {
              "id": 27166,
              "nodeType": "FunctionDefinition",
              "src": "140:101:36",
              "nodes": [],
              "body": {
                "id": 27165,
                "nodeType": "Block",
                "src": "169:72:36",
                "nodes": [],
                "statements": [
                  {
                    "expression": {
                      "id": 27157,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "nodeType": "UnaryOperation",
                      "operator": "++",
                      "prefix": false,
                      "src": "179:8:36",
                      "subExpression": {
                        "id": 27156,
                        "name": "pushes",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 27153,
                        "src": "179:6:36",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      }
                    },
                    "id": 27158,
                    "nodeType": "ExpressionStatement",
                    "src": "179:8:36"
                  },
                  {
                    "eventCall": {
                      "arguments": [
                        {
                          "expression": {
                            "id": 27160,
                            "name": "msg",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": -15,
                            "src": "215:3:36",
                            "typeDescriptions": {
                              "typeIdentifier": "t_magic_message",
                              "typeString": "msg"
                            }
                          },
                          "id": 27161,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "sender",
                          "nodeType": "MemberAccess",
                          "src": "215:10:36",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        },
                        {
                          "id": 27162,
                          "name": "pushes",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 27153,
                          "src": "227:6:36",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          },
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        ],
                        "id": 27159,
                        "name": "ButtonPushed",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 27151,
                        "src": "202:12:36",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_address_$_t_uint256_$returns$__$",
                          "typeString": "function (address,uint256)"
                        }
                      },
                      "id": 27163,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "202:32:36",
                      "tryCall": false,
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 27164,
                    "nodeType": "EmitStatement",
                    "src": "197:37:36"
                  }
                ]
              },
              "functionSelector": "0a007972",
              "implemented": true,
              "kind": "function",
              "modifiers": [],
              "name": "pushButton",
              "nameLocation": "149:10:36",
              "parameters": {
                "id": 27154,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "159:2:36"
              },
              "returnParameters": {
                "id": 27155,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "169:0:36"
              },
              "scope": 27167,
              "stateMutability": "nonpayable",
              "virtual": false,
              "visibility": "public"
            }
          ],
          "abstract": false,
          "baseContracts": [],
          "canonicalName": "Button",
          "contractDependencies": [],
          "contractKind": "contract",
          "fullyImplemented": true,
          "linearizedBaseContracts": [
            27167
          ],
          "name": "Button",
          "nameLocation": "34:6:36",
          "scope": 27168,
          "usedErrors": []
        }
      ]
    },
    "id": 36
  }

  export default button