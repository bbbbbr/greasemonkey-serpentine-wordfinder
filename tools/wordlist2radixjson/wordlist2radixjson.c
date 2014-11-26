#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "radixtree.h"

void process_file(char *);
void trim_newline(char *);


int main( int argc, char *argv[] )
{
    if( argc == 2 )
    {
        process_file(argv[1]);
    }
    else if( argc > 2 )
    {
        printf("Too many arguments supplied\n");
    }
    else
    {
        printf("Filename argument expected\n");
        printf("Usage for piping out to a file: wordlist2radixjson <infile> > outfile\n");
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

            if (szWordLen >= WORD_MIN_LEN)
            {
                insert_node(strWord);

                wordCount++;
            }
        }

        fclose(pWordFile);
        free(strWord);

        tree_export_to_json();
    }
    else
    {
        printf("Error: Failed to open input file\n");
    }
}


void trim_newline(char *strWord)
{
    size_t szWordLen = strlen(strWord);
    if (szWordLen > 0)
        if (strWord[szWordLen - 1] == '\n')
            strWord[szWordLen - 1] = '\0';
}
