#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void process_file(char *);
void trim_newline(char *);

void insert_node(char *);
int search_node(char *);

void tree_export_to_json();
//void node_export(node *, unsigned char);

#define ALPHABET_SIZE 26
#define WORD_MIN_LEN   3

int main( int argc, char *argv[] )
{
    if( argc == 2 )
    {
//        printf("Opening file: %s\n", argv[1]);
        process_file(argv[1]);
    }
    else if( argc > 2 )
    {
        printf("Too many arguments supplied\n");
    }
    else
    {
        printf("Filename argument expected\n");
    }

    return 0;
}

void process_file(char *strFilename)
{
    FILE *        pWordFile;
    char *        strWord   = NULL;
    size_t        szWordLen = 0;
    ssize_t       readLen;
    unsigned long wordCount = 0;

    pWordFile = fopen (strFilename,"r");
    if (pWordFile!=NULL)
    {
        while ((readLen = getline(&strWord, &szWordLen, pWordFile)) != -1)
        {
            trim_newline(strWord);
            szWordLen = strlen(strWord);

/*
            // Debug
            if ((wordCount %10000) == 0)
                printf("...%s", strWord);
*/

            if (szWordLen >= WORD_MIN_LEN)
            {
                insert_node(strWord);

                wordCount++;
            }
        }

//        printf("\n");
        fclose(pWordFile);
        free(strWord);

/*
        // Testing
        printf("Words added: %zu\n",wordCount);
        printf("Searched value: %d\n",search("aa"));
        printf("Searched value: %d\n",search("aah"));
        printf("Searched value: %d\n",search("aahing"));
        printf("Searched value: %d\n",search("abraision"));
        printf("Searched value: %d\n",search("test"));
*/
        tree_export_to_json();

    }
    else
    {
        printf("Error: Failed to open file\n");
    }
}


void trim_newline(char *strWord)
{
    size_t szWordLen = strlen(strWord);
    if (szWordLen > 0)
        if (strWord[szWordLen - 1] == '\n')
            strWord[szWordLen - 1] = '\0';
}





// Radix Tree/Trie linked list code from :
// http://programminggeeks.com/c-code-for-radix-tree-or-trie/
//
// * Added parent linkage

struct node; // Forward Declaration

typedef struct node {
    int    data;
    struct node * link[ALPHABET_SIZE];

    struct node * parent;
    unsigned char has_children;
} node;

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

/*
JSON output looks like this in non-compacted form
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


void node_export(node * q, unsigned char depth)
{
    int x,c;
    int elementCount = 0;
    node * child;

    for (x = 0; x < ALPHABET_SIZE; x++)
    {
        // Explore the child link if present --> (this could be removed by testing for has_children at the start of the recursion)
        if (q->link[x] != NULL)
        {
            child = q->link[x];

            // If the node has children or completes a word (could be a terminal node), then print it
            if ((child->has_children) || (child->data > -1))
            {

//format                for (c = 0; c < depth; c++) printf(" "); // Indenting

                // If there are multiple elements in this node then a comma seperator is required
                elementCount++;
                if (elementCount > 1)
                    printf(",");

                // Print node letter and opening content bracket
                printf("\"%c\": {", ('a' + x));
//format                printf("\n");

                    // Indicate if it completes a word in the dictionary
                    if (child->data > -1)
                    {
//format                        for (c = 0; c < (depth + 1); c++) printf(" "); // Indenting

//format                        printf("\"isword\": 1"); // * %d", child->data);
                        printf("\"iw\": 1"); // * %d", child->data);

                        // Comma separator if needed
                        if (child->has_children)
                            printf(",");

//format                        printf("\n");
                    }

                    // Handle children of this node if any are present
                    if (child->has_children)
                        node_export(child, depth + 1);

                // Close out the node
//format                for (c = 0; c < depth; c++) printf(" "); // Indenting
                printf("}");
//format                printf("\n");
            } // End : if ((child->has_children) || (child->data > -1))
        } // End : if (q->link[x] != NULL)
    } // End : for (x = 0; x < ALPHABET_SIZE; x++)

} // End : node_export()




void tree_export_to_json()
{
    //node * q = root;
    //node * child;
    int x;

    int c,indent = 0;

    // Start json structure
//    printf("var wordlist = ");
    printf("{\n");

    // Export the tree
    node_export(root,0);

    // Close json structure
    printf("}\n");
//    printf(";\n");

}

// ----------------------------------------------------------------------

