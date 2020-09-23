// ---------- EXAMPLE VSM-SENTENCES ----------

function vsmExamplesList(opt) {
  opt = {
    addTheTestExample: false,
    ...opt
  };


  var vsmExamples = [
    // --- 0  // This one's button says 'Clear'.
    {
      terms: [],
      conns: []
    },

    // --- 1
    {
      terms: [
        { str: 'John',    classID: 'PRS:0010', instID: null },
        { str: 'eats',    classID: 'VAR:0101', instID: null },
        { str: 'chicken', classID: 'BIO:0042', instID: null,
          dictID: 'http://example.org/BIO',  descr: 'the animal',
          queryOptions: { sort: { dictID: ['http://example.org/BIO'] } } },
        { str: 'with',    classID: 'VAR:0105', instID: null,
          dictID: 'VAR',  descr: 'using' },
        { str: 'fork',    classID: 'VAR:0108', instID: null,
          queryOptions: { fixedTerms: [ { id: 'VAR:0107', str: 'spoon' } ] } }
      ],
      conns: [
        { type: 'T', pos: [0, 1, 2] },
        { type: 'T', pos: [1, 3, 4] }
      ]
    } ||
    // --- (1b, [unused] alternative for 1, perhaps cleaner for RDF).
    {
      terms: [
        { str: 'John',    classID: 'http://ont.ex/John',    instID: 'http://db.ex/00' },
        { str: 'eats',    classID: 'http://ont.ex/to-eat',  instID: 'http://db.ex/01' },
        { str: 'chicken', classID: 'http://ont.ex/chicken', instID: 'http://db.ex/02' },
        { str: 'with',    classID: 'http://ont.ex/to-use',  instID: 'http://db.ex/03' },
        { str: 'fork',    classID: 'http://ont.ex/fork',    instID: 'http://db.ex/04' }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 1, 3, 4 ] }
      ]
    },

    // --- 2
    {
      terms: [
        { str: 'Alice', classID: 'PRS:0001', instID: null, dictID: 'PRSNS' },
        { str: 'reading', classID: null, instID: null },
        { str: 'letter', classID: null, instID: null },
        { str: 'from', classID: 'VAR:0025', instID: null, dictID: 'VAR' },
        { str: 'John', classID: 'PRS:0010', instID: null, dictID: 'PRSNS' },
        { str: 'eats', classID: 'VAR:0101', instID: null,  dictID: 'VAR', descr: 'to eat' },
        { str: 'potato', classID: null, instID: null },
        { str: 'tomato', classID: null, instID: null },
        { str: 'and', classID: 'VAR:0005', instID: null,  dictID: 'VAR', descr: 'a set of items' },
        { str: 'almost', classID: null, instID: null },
        { str: '2', classID: '00:2e+0', instID: null, dictID: '00' },
        { str: 'fish', classID: null, instID: null },
        { str: 'with', classID: 'VAR:0105', instID: null,  dictID: 'VAR', descr: 'using' },
        { str: 'blue', classID: null, instID: null },
        { str: 'fork', classID: 'VAR:0108', instID: null, dictID: 'VAR',
          descr: 'utensil<i class=\'sep\'></i><i class=\'fas fa-utensils\'></i>' }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 10, -1, 9 ] },
        { type: 'T', pos: [ 11, -1, 10 ] },
        { type: 'L', pos: [ 8, 6, 7, 11 ] },
        { type: 'T', pos: [ 0, 5, 8 ] },
        { type: 'T', pos: [ 5, 12, 14 ] },
        { type: 'T', pos: [ 14, -1, 13 ] }
      ]
    },

    // --- 3
    {
      terms: [
        { str: 'John',          classID: 'http://ont.ex/John',          instID: 'http://db.ex/00' },
        { str: 'pushing',       classID: 'http://ont.ex/to-push',       instID: 'http://db.ex/01' },
        { str: 'button',        classID: 'http://ont.ex/button',        instID: 'http://db.ex/02' },
        { str: 'having color',  classID: 'http://ont.ex/to-have-color', instID: 'http://db.ex/03' },
        { str: 'green',         classID: 'http://ont.ex/green',         instID: 'http://db.ex/04' },
        { str: 'causes',        classID: 'http://ont.ex/to-cause',      instID: 'http://db.ex/05' },
        { str: 'it',            classID: 'http://ont.ex/button',        instID: 'http://db.ex/06', parentID: 'http://db.ex/02' },
        { str: 'to have color', classID: 'http://ont.ex/to-have-color', instID: 'http://db.ex/07' },
        { str: 'red',           classID: 'http://ont.ex/red',           instID: 'http://db.ex/08' },
        { str: 'and',           classID: 'http://ont.ex/and',           instID: 'http://db.ex/09' },
        { str: 'tiny',          classID: 'http://ont.ex/tiny',          instID: 'http://db.ex/10' },
        { str: 'bomb',          classID: 'http://ont.ex/bomb',          instID: 'http://db.ex/11' },
        { str: 'to explode',    classID: 'http://ont.ex/to-explode',    instID: 'http://db.ex/12' }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 6, 7, 8 ] },
        { type: 'T', pos: [ 11, -1, 10 ] },
        { type: 'T', pos: [ 11, 12, -1 ] },
        { type: 'L', pos: [ 9, 7, 12 ] },
        { type: 'T', pos: [ 1, 5, 9 ] },
        { type: 'R', pos: [ 6, 2 ] }
      ]
    },

    // --- 4
    {
      terms: [
        { str: 'John',      classID: 'http://ont.ex/John',          instID: null },
        { str: 'saying',    classID: 'http://ont.ex/to-say',        instID: null },
        { str: 'duck',      classID: 'http://ont.ex/duck'                        },  // Class
        { str: 'has label', classID: 'http://ont.ex/to-have-label', instID: null },
        { str: 'canard'                                                          },  // Literal
        { str: 'implies',   classID: 'http://ont.ex/to-imply',      instID: null },
        { str: 'he',        classID: 'http://ont.ex/John',          instID: null, parentID: null },  // RefInstance
        { str: 'knows',     classID: 'http://ont.ex/to-know',       instID: null },
        { str: 'French',    classID: null,                          instID: null }   // =request to create new Class.
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 3 ] },
        { type: 'T', pos: [ 6, 7, 8 ] },
        { type: 'T', pos: [ 1, 5, 7 ] },
        { type: 'R', pos: [ 6, 0 ] }
      ]
    },

    // --- 5
    {
      terms: [
        { str: 'UV', classID: null, instID: null },
        { str: 'induces', classID: null, instID: null },
        { str: 'NEDD4', classID: null, instID: null },
        { str: 'to ubiquitinate', classID: null, instID: null },
        { str: 'RNA polymerase II', classID: null, instID: null },
        { str: 'in', classID: 'to-be-located-in', instID: null },
        { str: 'nucleus', classID: null, instID: null },
        { str: 'negatively regulates', classID: null, instID: null },
        { str: 'it', classID: null, instID: null, parentID: null },
        { str: 'activating', classID: null, instID: null },
        { str: 'transcription', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 3, 5, 6 ] },
        { type: 'T', pos: [ 0, 1, 3 ] },
        { type: 'T', pos: [ 8, 9, 10 ] },
        { type: 'T', pos: [ 3, 7, 9 ] },
        { type: 'R', pos: [ 8, 4 ] }
      ]
    },

    // --- 6
    {
      terms: [
        { str: 'UV', classID: null, instID: null },
        { str: 'causally upstream of',
          classID: 'http://purl.obolibrary.org/obo/RO_0002411',
          instID: null,
          dictID: 'http://data.bioontology.org/ontologies/OBOREL'
        },
        { str: 'NEDD4',
          //classID: 'UniProtKB:P46934',
          classID: 'https://www.uniprot.org/uniprot/P46934',
          instID: null,
          //dictID: 'http://golr-aux.geneontology.io'
          dictID: 'https://www.uniprot.org'
        },
        { str: 'ubiquitinating',
          classID: 'http://purl.obolibrary.org/obo/RO_0002480',
          instID: null,
          dictID: 'http://data.bioontology.org/ontologies/OBOREL'
        },
        { str: 'RNA polymerase II', classID: null, instID: null },
        { str: 'in', classID: 'to-be-located-in', instID: null },
        { str: 'nucleus', classID: null, instID: null },
        { str: 'negatively regulates',
          classID: 'http://purl.obolibrary.org/obo/RO_0002212',
          instID: null,
          dictID: 'http://data.bioontology.org/ontologies/OBOREL'
        },
        { str: 'it', classID: null, instID: null, parentID: null },
        { str: 'activating', classID: null, instID: null },
        { str: 'transcription', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 3, 5, 6 ] },
        { type: 'T', pos: [ 0, 1, 3 ] },
        { type: 'T', pos: [ 8, 9, 10 ] },
        { type: 'T', pos: [ 3, 7, 9 ] },
        { type: 'R', pos: [ 8, 4 ] }
      ]
    },

    // --- 7 : A VSM-template, see MI2CAST and causalBuilder.
    { terms: [
        { queryOptions: { filter: { dictID: [
            'https://www.uniprot.org',
            'https://www.ebi.ac.uk/complexportal'
          ]}},
          placeholder: 'protein' },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/MI',
            'http://data.bioontology.org/ontologies/OBOREL'
          ]}},
          placeholder: 'regulation'
        },
        { queryOptions: { filter: { dictID: [
            'https://www.ensembl.org',
            'http://www.ensemblgenomes.org',
            'https://www.rnacentral.org'
          ]}},
          placeholder: 'gene'
        },
        { str    : 'in',
          classID: 'http://example.org/ID:has_location',
          instID : null
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/GO'
          ]}},
          placeholder: 'compartment'
        },
        { str    : 'has reference',
          classID: 'http://example.org/ID:has_reference',
          instID : null
        },
        { queryOptions: { filter: { dictID: [
                'https://www.ncbi.nlm.nih.gov/pubmed'
            ]}},
          placeholder: 'reference'
        },
        { str    : 'is assessed by',
          classID: 'http://example.org/ID:is_assessed_by',
          instID : null
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/ECO'
          ]}},
          placeholder: 'evidence'
      }],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 1, 5, 6 ] },
        { type: 'T', pos: [ 1, 7, 8 ] }
      ]
    },

    // --- 8: A larger VSM-template.
    { terms: [
        { queryOptions: { filter: { dictID: [
            'https://www.uniprot.org',
            'https://www.ebi.ac.uk/complexportal'
          ]}},
          placeholder: 'source'
        },
        { str: 'has modif.',
          classID: 'http://example.org/ID:has_biological_modification',
          instID: null
        },
        { queryOptions: {
            filter: { dictID: [
                'http://data.bioontology.org/ontologies/PSIMOD' ] },
            fixedTerms: [ {
              id: 'http://purl.obolibrary.org/obo/MOD_00696',
              str: 'phosphorylated residue' } ]
          },
          placeholder: 'modification'
        },
        { str: 'has modif.',
          classID: 'http://example.org/ID:has_biological_modification',
          instID: null
        },
        { queryOptions: {
            filter: { dictID: [
                'http://data.bioontology.org/ontologies/PSIMOD' ] },
            fixedTerms: [ {
              id: 'http://purl.obolibrary.org/obo/MOD_00696',
              str: 'phosphorylated residue' } ]
          },
          placeholder: 'modification'
        },
        { str: 'of',
          classID: 'http://example.org/ID:affects',
          instID: null
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/CHEBI'
          ]}},
          editWidth: 50,
          placeholder: 'residue'
        },
        { str: 'at',
          classID: 'http://example.org/ID:is_located_at_amino_acid_position_number',
          instID: null
        },
        { queryOptions: { filter: { dictID: [
            'https://w3id.org/00'
          ]}},
          editWidth: 26,
          placeholder: 'pos'
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/MI',
            'http://data.bioontology.org/ontologies/OBOREL'
          ]}},
          placeholder: 'causal relation'
        },
        { queryOptions: { filter: { dictID: [
            'https://www.ensembl.org',
            'http://www.ensemblgenomes.org',
            'https://www.rnacentral.org'
          ]}},
          placeholder: 'target'
        },
        { str: 'in',
          classID: 'http://example.org/ID:has_location',
          instID: null
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/GO'
          ]}},
          placeholder: 'compartment'
        },
        { str: 'has ref.',
          classID: 'http://example.org/ID:has_reference',
          instID: null
        },
        { queryOptions: { filter: { dictID: [
            'https://www.ncbi.nlm.nih.gov/pubmed'
          ]}},
          editWidth: 60,
          placeholder: 'reference'
        },
        { str: 'is assessed by',
          classID: 'http://example.org/ID:is_assessed_by',
          instID: null
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/ECO'
          ]}},
          placeholder: 'evidence'
        }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 4, 5, 6 ] },
        { type: 'T', pos: [ 4, 7, 8 ] },
        { type: 'T', pos: [ 0, 3, 4 ] },
        { type: 'T', pos: [ 10, 11, 12 ] },
        { type: 'T', pos: [ 0, 9, 10 ] },
        { type: 'T', pos: [ 9, 13, 14 ] },
        { type: 'T', pos: [ 9, 15, 16 ] }
      ]
    },

    // --- LAST = Test Example:  Demo with all VSM features, as a test.
    { terms: [
        { str: 'Test', classID: 'ex:123', instID: 'dbid45', //minWidth: 23,
          queryOptions: { fixedTerms: [{id:'PRS:0001'}, {id:'BIO:0010'}] },
          placeholder: 'person'
        },
        { str: 'activates', classID: null, instID: null, isFocal: true },
        { str: 'isβiuabcdefg', style: 'b1;i0-2;s1;u4;s5-11;s6-11;u7-11;u8-9',
          classID: null, instID: null },
        { str: 'test jklm .', classID: null, instID: null, maxWidth: 37 },
        { str: 'with', classID: null, instID: null },
        { str: 'itself', classID: 'ex:123', instID: 'dbid50',
          parentID: 'dbid45' },
        { str: 'cls', classID: null },
        { str: 'lit' },
        {             editWidth: 20, placeholder: 'pl' },
        { type: 'ER', editWidth: 18, placeholder: 'pl' },
        { type: 'EC', editWidth: 20 },
        { type: 'EL', editWidth: 20 }
      ],
      conns: [
        { type: 'T', pos: [ 3, -1, 2 ] },
        { type: 'T', pos: [ 0, 1, 3 ] },
        { type: 'T', pos: [ -1, 6, 7 ] },
        { type: 'T', pos: [ 10, 11, -1 ] },
        { type: 'L', pos: [ 9, 5, 6, 8, 11 ] },
        { type: 'T', pos: [ 1, 4, 9 ] },
        { type: 'R', pos: [ 5, 0 ] }
      ]
    } ||
    // --- (Earlier test example [unused now]).
    {
      terms: [
        { str: 'John',      classID: 'PRS:0010', instID: 'db-id20',
          dictID: 'PRSNS',  descr: 'an example John',
          minWidth: 5, maxWidth: 80, editWidth: 50,
          queryOptions: {
            filter: { dictID: [ 'PRSNS', 'VAR' ] },
            sort: { dictID: [ 'VAR' ] },
            fixedTerms: [
              { id: 'PRS:0001', str: 'Alice' }, { id: 'BIO:0010' }  ] }
        },
        { str: 'activates', classID: 'BIO:0014', instID: null,
          isFocal: true },
        { str: 'spicy',     classID: 'VAR:0215', instID: null },
        { str: 'chicken',   classID: 'BIO:0042', instID: null,
          dictID: 'http://example.org/BIO',  descr: 'the animal',
          queryOptions: { sort: { dictID: ['http://example.org/BIO'] } } },
        { str: 'with',      classID: 'VAR:0105', instID: null,
          dictID: 'VAR',  descr: 'using' },
        { str: 'Ca2+', style: 'u2-4', descr: 'Calcium ion',
          classID: 'BIO:0010', instID: null },  ///, minWidth: 47},
        { str: 'with',      classID: 'VAR:0106', instID: null,
          dictID: 'VAR',  descr: 'accompanied by' },
        { str: 'cls', classID: 'A:01', dictID: 'A', descr: 'descr-1' },
        { str: 'lit' },
        { editWidth: 20, placeholder: 'pl' },
        { type: 'EC', editWidth: 20 },
        { type: 'EL', editWidth: 20 },
        { str: 'and',       classID: 'VAR:0005', instID: null,
          dictID: 'VAR',  descr: 'a set of items' },
        { str: 'himself',   classID: 'PRS:0010', instID: 'db-id40',
          parentID: 'db-id20'}
      ],
      conns: [
        { type: 'T', pos: [ 3, -1, 2 ] },
        { type: 'T', pos: [ 0, 1, 3 ] },
        { type: 'T', pos: [ 1, 4, 5 ] },
        { type: 'L', pos: [ 12, 7, 8, 9, 10, 11, 13 ] },
        { type: 'T', pos: [ 1, 6, 12 ] },
        { type: 'R', pos: [ 13, 0 ] }
      ]
    },
  ];

  if (!opt.addTheTestExample)  vsmExamples.pop();  // Removes the test-example.

  return vsmExamples;
}
