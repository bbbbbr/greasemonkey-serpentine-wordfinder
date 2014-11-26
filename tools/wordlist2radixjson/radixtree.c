// radixtree.c

// Radix Tree/Trie linked list code from :
// http://programminggeeks.com/c-code-for-radix-tree-or-trie/
//
// * Added parent node linkage
// * Added has_children convenience property

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "radixtree.h"

node * root = NULL;

node * create_node(node * parent)
{
    node *q = (node *)malloc(sizeof(node));
    int x;
    for(x = 0; x < ALPHABET_SIZE; x++)
        q->link[x] = NULL;
    q->data = -1;

    if (parent != NULL) q->parent = parent; /* don't set parent if it's the root node */
    q->has_children = 0;

    return q;
}

// Look at this function like this: (Comparing it with LinkedList traversal for adding a node at the end of the list)
// Keep traversing, (q = q->link[index] instead of q = q->link) until we get q->link[index] == NULL (instead of q->link == NULL)
// When we get NULL, then instead of adding just 1 node and making the previous node point to it, we create as many new nodes
// as the value of (length - level) at that time.
void insert_node(char * key) {
    int length = strlen(key);
    int index;
    int level = 0;
    if(root == NULL)
        root = create_node((node *)NULL);
    node *q = root;  // For insertion of each String key, we will start from the root

    for(;level < length;level++) {
        // At each level, find the index of the corresponding
        // character (a-z = 0-26)
        index = key[level] - 'a';

        if(q->link[index] == NULL) {
            // Put the value of this character inside q->link[index]
            // and create 1 more node to which this node will point
            q->link[index] = create_node(q);  // which is : node *p = create_node(); q->link[index] = p;
            q->has_children = 1;
        }

        q = q->link[index];
    }
    // Now, the last character(node) of the String key will contain the value of this key
    q->data = level; // Assuming the value of this particular String key is 11
}

int search(char * key) {
    node *q = root;
    int length = strlen(key);
    int level = 0;
    for(;level < length;level++) {
        int index = key[level] - 'a';
        if(q->link[index] != NULL)
            q = q->link[index];
        else
            break;
    }
    if(key[level] == '\0' && q->data != -1)
        return q->data;
    return -1;
}


// ----------------------------------------------------------------------
// Export functions
// ----------------------------------------------------------------------

/*
JSON output is as follows in non-compacted form
(spaces and line breaks are not present in output to reduce file size)

For the example below :
 * Words present in the tree: "bar", "bars", "foo"
 * The "iw" property indicates the current node and all of it's parents constitute a valid word

var wordlist = {
    b: {
        a: {
            r: {
                iw: 1,
                s: {
                    iw: 1
                }
            }
        }
    },
    f: {
        o: {
            o: {
                iw: 1
            }
        }
    }
};

*/

// == node_export ==
// Uses recursion to walk the word list node tree and export it in json format
//
// input :
//   * currentNode : On first call this should be the root node, thereafter it will be a given child node
//
void node_export(node * currentNode)
{
    int x;
    int elementCount = 0;
    node * child;

    for (x = 0; x < ALPHABET_SIZE; x++)
    {
        // Explore each child link if present
        if (currentNode->link[x] != NULL)
        {
            child = currentNode->link[x];

            // If the node has children or completes a word (could be a terminal node), then print it
            if ((child->has_children) || (child->data > -1))
            {
                // If there are multiple elements in this node then a comma seperator is required
                elementCount++;

                if (elementCount > 1)
                    printf(",");


                // Print node letter and opening content bracket
                printf("\"%c\": {", ('a' + x));

                // If it completes a word in the dictionary then add an indicator ("iw" property with value "1")
                if (child->data > -1)
                {
                    printf("\"iw\": 1"); // * %d", child->data);

                    // Comma separator is needed if a child node entry will get appended after this
                    if (child->has_children)
                        printf(",");
                }

                // Handle children of this node if any are present
                if (child->has_children)
                    node_export(child);

                // Close out the node
                printf("}");
            } // End : if ((child->has_children) || (child->data > -1))
        } // End : if (currentNode->link[x] != NULL)
    } // End : for (x = 0; x < ALPHABET_SIZE; x++)

} // End : node_export()



void tree_export_to_json()
{
    // Start json structure
    printf("{\n");

    // Export the tree, starting with the root node
    node_export(root);

    // Close json structure
    printf("}\n");
}

