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


const merkleRoot = generateMerkleRoot(hashes);

const generatedMerkleProof = generateMerkleProof(hashes[4], hashes);

const merkleTree = generateMerkleTree(hashes);

const merkleRootFromMerkleProof = getMerkleRootFromMerkleProof(generatedMerkleProof);

console.log('merkleRoot: ', merkleRoot);
console.log('generatedMerkleProof: ', generatedMerkleProof);
console.log('merkleTree: ', merkleTree);
console.log('merkleRootFromMerkleProof: ', merkleRootFromMerkleProof);
console.log('merkleRootFromMerkleProof === merkleRoot: ', merkleRootFromMerkleProof === merkleRoot);