// radixtree.h

#define ALPHABET_SIZE 26
#define WORD_MIN_LEN   3

struct node; // Forward Declaration

typedef struct node {
    int    data;
    struct node * link[ALPHABET_SIZE];

    struct node * parent;
    unsigned char has_children;
} node;

void insert_node(char *);
int search_node(char *);

void tree_export_to_json();
void node_export(node *);

