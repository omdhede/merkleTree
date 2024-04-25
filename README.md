# Merkle Tree

## Theory
Blockchains like Bitcoin use Merkle trees to check if a transaction belongs to the merkle root in a block header.

Each software using the Merkle tree structure is free to use any implementation they see fit.

Bitcoin, for example, converts the concatenated hash to binary first, before hashing it again.

Bitcoin also uses a double sha256 hash, something like:
```javascript
const result = sha256(sha256(binaryOfTheConcatenatedHashes))
```


## What is double SHA-256 used for?
SHA-256 double hashing, often referred to as "double SHA-256," is a cryptographic process where the SHA-256 hash function is applied twice in succession to data. This method is commonly used in various applications, most notably in `Bitcoin` and other cryptocurrencies to enhance security measures.

Character Length: `64 characters`.
Byte Size: `32 bytes` (since 2 characters represent 1 byte).
This is consistent with the output of SHA-256, which always generates a `256-bit hash`, equivalent to 32 bytes.

Here’s how SHA-256 double hashing works:

1. **First Hashing**: The data (it could be any form of input, like a text message, a file, or binary data) is processed through the SHA-256 hashing function. This generates a fixed-size 256-bit hash output.

2. **Second Hashing**: The output hash from the first step is then fed back into the SHA-256 hash function for a second time. The result is the final double SHA-256 hash.

The rationale behind performing the hash twice is to guard against potential vulnerabilities such as length extension attacks, and in the case of Bitcoin, to make certain types of attacks more computationally demanding.

Here is a simple example of how to perform SHA-256 double hashing in Node.js using the crypto library:

```javascript
const crypto = require('crypto');

function sha256(data) {
    return crypto.createHash('sha256').update(data).digest();
}

function doubleSha256(data) {
    return sha256(sha256(data));
}

const data = "Hello, world!";
const result = doubleSha256(data);
console.log(result.toString('hex'));  // Output will be the hexadecimal representation of the double SHA-256 hash.
```

This example defines a `doubleSha256` function that applies SHA-256 twice to any input data, and outputs the hash as a hexadecimal string.

## Advantages and Disadvantages of *Merkle Trees*

Certainly! Here's a more concise summary of the advantages and disadvantages of Merkle trees:

### Advantages

1. **Efficient Verification**: Quickly verifies specific data within large datasets using cryptographic hashes.
2. **Tamper Evident**: Any modification in data alters the root hash, making changes easily detectable.
3. **Parallel Processing**: Supports concurrent building and verification, enhancing performance in distributed systems.
4. **Data Integrity**: Isolates and identifies altered data blocks without scanning the entire dataset.
5. **Scalability**: Grows logarithmically with the data size, suitable for large-scale applications.

### Disadvantages

1. **Complex Management**: Implementation and maintenance can be complex due to the need for balancing and consistent updates.
2. **Storage Overhead**: Requires additional storage for hashes at each node, increasing space requirements.
3. **Computational Cost**: Building the tree is resource-intensive, especially with frequent data changes.
4. **Balancing Challenges**: Keeping the tree balanced during updates can be cumbersome and require additional adjustments.
5. **Update Latency**: Changes in data necessitate rehashing paths to the root, introducing delays in large trees.

## Implementation in Nodejs
```javascript
const crypto = require('crypto');

// define left and right
const LEFT = 'left';
const RIGHT = 'right';

// defining the hashes
// so, here I am using certain string like messages to hash.
const hashes = [
    'Hello World',
    'Where am I?',
    'I am ready to work!!',
    'I am a developer',
    'I am recently working on my portfolio.',
    'I thing this is enough!',
    'Let me add one more',
    'This is the last one',
    'This is last bss hua'
]

// create a function that will take the data or say hashes and help us abstract the sha256 hashing
const sha256 = (data) => {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest()
        .toString('hex');
};

// create a function to calculate if a leaf node is a left or right child nodeee
// here pass the has and the merkle tree to find the direction and the index of the hash
const getLeafNodeDirectionInMerkleTree = (hash, merkleTree) => {
    const hashIndex = merkleTree[0].findIndex(h => h === hash);
    return hashIndex % 2 === 0 ? LEFT : RIGHT;
    // % 2 === 0 means the hash is at even index, so it is a left child
};

/* 
    * create a function to identify if the hashes has an odd length if so copy the last hash and add it to the end of the hash list

    * If the hashes length is not even, then it copies the last hash and adds it to the
      end of the array, so it can be hashed with itself.
*/
function ensureEven(hashes) {
    if(hashes.length % 2 !== 0) {
        hashes.push(hashes[hashes.length - 1]);
    }
}

/*
    * Create a function that will return merkle root 
    * Recursively cincatenate pair of hashes and calculate each sha256 hash of the concatenated hashes until only one has is left,
    * Which is the Merkle root.
 */

function generateMerkleRoot(hashes) {
    if(!hashes || hashes.length === 0) {
        return '';
    }
    ensureEven(hashes);
    const combinedHashes = [];
    for(let i = 0; i < hashes.length; i += 2) {
        const hashPairConcatenated = hashes[i] + hashes[i + 1];
        const hash = sha256(hashPairConcatenated);
        combinedHashes.push(hash);
    }
    if(combinedHashes.length === 1) {
        return combinedHashes.join('');
    }
    return generateMerkleRoot(combinedHashes);
}

// let's print the Root node of the Merkle tree

const merkleRoot = generateMerkleRoot(hashes);
console.log(merkleRoot);
```

>This would Print:
> `cc5c512b7709b774465c79de4ddaebd193add0389cd135d84ecda6972cd3c26d`

## Let's create a Merkle Tree
```javascript
// continue to the above code

/*
    * Create a Merkle tree function from the provided hashes
    * Creates a Merkle tree recursively
    * In the array at position tree[0] there are all the original hashes.
    * In the array at position tree[1] the combined pair or sha256 hashes.
    * In the last position there is only one hash, which is the root of the tree, or Merkle root.
*/

function generateMerkleTree(hashes) {
    if(!hashes || hashes.length === 0) {
        return [];
    }
    const tree = [hashes];
    const generate = (hashes, tree) => {
        if(hashes.length === 1) {
            return hashes;
        }
        ensureEven(hashes);
        const combinedHashes = [];
        for(let i = 0; i < hashes.length; i += 2) {
            const hashesConcatenated = hashes[i] + hashes[i + 1];
            const hash = sha256(hashesConcatenated);
            combinedHashes.push(hash);
        }
        tree.push(combinedHashes);
        return generate(combinedHashes, tree);
    }
    generate(hashes, tree);
    return tree;
}

const merkleTree = generateMerkleTree(hashes);
console.log(merkleTree);
```

## Let's now generate the Merkle Proof
### Merkle Proof is defining left and right to the nodes of the Merkle tree
```javascript
/*
    * Generate the Merkle proog by first creating the Merkle Tree
    * Left or right child
    * The hash of index 0 would be a left child
    * The hash of index 1 would be a right child
    * The even would be left and the odd would be right
*/
function generateMerkleProof(hash, hashes) {
    if(!hash || !hashes || hashes.length === 0) {
        return null;
    }
    const tree = generateMerkleTree(hashes);
    const merkleProof = [{
        hash,
        direction: getLeafNodeDirectionInMerkleTree(hash, tree)
    }];
    let hashIndex = tree[0].findIndex(h => h === hash);
    for(let level = 0; level < tree.length - 1; level++) {
        const isLeftChild = hashIndex % 2 === 0;
        const siblingDirection = isLeftChild ? RIGHT : LEFT;
        const siblingIndex = isLeftChild ? hashIndex + 1 : hashIndex - 1;
        const siblingNode = {
            hash: tree[level][siblingIndex],
            direction: siblingDirection
        };
        merkleProof.push(siblingNode);
        hashIndex = Math.floor(hashIndex / 2);
    }
    return merkleProof;
}

const generatedMerkleProof = generateMerkleProof(hashes[4], hashes);
console.log('generatedMerkleProof: ', generatedMerkleProof);
```

## Merkle Proof Verification
### merkle tree is also known for its reconstruction process, to verify a hash as a part of Merkle root
```javascript
function getMerkleRootFromMerkleProof(merkleProof) {
    if(!merkleProof || merkleProof.length === 0) {
        return '';
    }
    const merkleRootFromProof = merkleProof.reduce((hashProof1, hashProof2) => {
        if(hashProof2.direction === RIGHT) {
            const hash = sha256(hashProof1.hash + hashProof2.hash);
            return { hash };
        }
        const hash = sha256(hashProof2.hash + hashProof1.hash);
        return { hash };
    });
    return merkleRootFromProof.hash;
}

const merkleRootFromMerkleProof = getMerkleRootFromMerkleProof(generateMerkleProof);
console.log(merkleRootFromMerkleProof)
console.log('Reconstruction boolean: ',merkleRootFromMerkleProof === merkleRoot);
```