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

    // --- The introductory 'John eats chicken' example.
    {
      terms: [
        { TIP1: '--- Mouse-hover some blue VSM-terms => the data herebelow pops up',
          TIP2: '--- Or drag them around and see this data change',
          str: 'John',    classID: 'https://orcid.org/0000-0002-1175-2668',
          instID: 'http://127.0.0.1/platform-database-instance-id-007',
          dictID: 'https://orcid.org',
          descr: 'Dr. John Doe' },
        { str: 'eats',    classID: 'http://purl.obolibrary.org/obo/RO_0002470',
          instID: null,
          descr: 'an eating activity, to eat' },
        { str: 'chicken', classID: 'http://purl.obolibrary.org/obo/FOODON_03411457',
          instID: null,
          dictID: 'https://www.ebi.ac.uk/ols/ontologies/foodon',
          descr: 'chicken meat food product' },
        { str: 'with',    classID: 'https://en.wiktionary.org/wiki/use?1#Noun',
          instID: null,   descr: 'using, use of, uses, to use' },
        { str: 'fork',    classID: 'http://wordvis.com/q=104380255',
          instID: null,
          descr: 'a utensil to stab and hold food' }
      ],
      conns: [
        { type: 'T', pos: [0, 1, 2] },
        { type: 'T', pos: [1, 3, 4] }
      ]
    },

    // --- The 'John eats chicken' example, as a template.
    {
      terms: [
        { str: 'John',    classID: 'PRS:0010', instID: null },
        { str: 'eats',    classID: 'VAR:0101', instID: null },
        { placeholder: 'food',
          queryOptions: { filter: { dictID: [
            'http://example.org/BIO',
            'http://example.org/VAR'
          ] } }
        },
        { str: 'with',    classID: 'VAR:0105', instID: null,  descr: 'using' },
        { placeholder: 'utensil',
          editWidth: 60,
          queryOptions: { fixedTerms: [
            { id: 'VAR:0108', str: 'fork' },
            { id: 'VAR:0107', str: 'spoon' },
          ] }
        },
        /// { str: 'in',    classID: 'VAR:0105', instID: null,
        ///   dictID: 'VAR',  descr: 'using' },
        /// { placeholder: 'location' }
      ],
      conns: [
        { type: 'T', pos: [0, 1, 2] },
        { type: 'T', pos: [1, 3, 4] },
        /// { type: 'T', pos: [1, 5, 6] }
      ]
    },

    // --- First example with a list-connector.
    {
      terms: [
        { str: 'Alice', classID: 'PRS:0001', instID: null },
        { str: 'reading', classID: null, instID: null },
        { str: 'letter', classID: null, instID: null },
        { str: 'from', classID: 'VAR:0025', instID: null },
        { str: 'John', classID: 'PRS:0010', instID: null },
        { str: 'eats', classID: 'VAR:0101', instID: null },
        { str: 'potato', classID: null, instID: null },
        { str: 'tomato', classID: null, instID: null },
        { str: 'and', classID: 'VAR:0005', instID: null, descr: 'a set of items' },
        { str: 'almost', classID: null, instID: null },
        { str: '2', classID: 'https://w3id.org/00/2e+0', instID: null },
        { str: 'fish', classID: null, instID: null },
        { str: 'with', classID: 'VAR:0105', instID: null },
        { str: 'blue', classID: null, instID: null },
        { str: 'fork', classID: 'VAR:0108', instID: null,
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

    // --- The 'cat' example with a coreference connector.
    { terms: [
        { str: 'Bob', classID: null, instID: null },
        { str: 'pets', classID: null, instID: null },
        { str: 'cat', classID: null, instID: null },
        { str: 'on', classID: null, instID: null },
        { str: 'chair', classID: null, instID: null },
        { str: 'until', classID: null, instID: null },
        { str: 'Eve', classID: null, instID: null },
        { str: 'feeds', classID: null, instID: null },
        { str: 'it', classID: null, instID: null, parentID: null },
        { str: 'on', classID: null, instID: null },
        { str: 'floor', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 8, 9, 10 ] },
        { type: 'T', pos: [ 6, 7, 8 ] },
        { type: 'T', pos: [ 1, 5, 7 ] },
        { type: 'R', pos: [ 8, 2 ] }
      ]
    },

    // --- 'Rocket on moon' example with a coreference.
    { terms: [
        { str: 'Eve', classID: 'PRS:0005', instID: null, dictID: 'PRSNS' },
        { str: 'launches', classID: null, instID: null },
        { str: 'rocket', classID: null, instID: null },
        { str: 'on', classID: null, instID: null, dictID: 'VAR' },
        { str: 'Moon', classID: null, instID: null },
        { str: 'results in', classID: null, instID: null },
        { str: 'it', classID: null, instID: null, parentID: null },
        { str: 'lands', classID: null, instID: null },
        { str: 'on', classID: null, instID: null },
        { str: 'Mars', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 6, 7, -1 ] },
        { type: 'T', pos: [ 1, 5, 7 ] },
        { type: 'R', pos: [ 6, 2 ] },
        { type: 'T', pos: [ 7, 8, 9 ] }
      ]
    },

    // --- Example with three main connector types, and two bidents.
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

    // --- Example with the four VSM-term types.
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


    // --- First biological example.
    { terms: [
        { str: 'leaf lamina', classID: 'http://purl.obolibrary.org/obo/PO_0020039', instID: null,
          descr: 'The blade or flat part of a leaf.' },
        { str: 'is', classID: 'http://example.org/ID/has_state', instID: null },
        { str: 'twisted', classID: 'http://purl.obolibrary.org/obo/PATO_0002445', instID: null,
          descr: 'The shape of being twisted or turned. Synonym of: torsioned.'},
        { str: 'in', classID: 'http://example.org/ID/pertains_to', instID: null },
        { str: 'Rice', classID: 'http://purl.obolibrary.org/obo/NCBITaxon_4530', instID: null,
          descr: 'The species \'Oryza sativa\'. Synonyms: rice, red rice.' },
        { str: 'underexpressing', classID: 'http://purl.obolibrary.org/obo/PHI_2000012', instID: null,
          descr: 'Synonym: Gene downregulation.' },
        { str: 'YAB3', classID: 'https://www.araport.org/locus/AT4G00180', instID: null },
        { str: 'by', classID: 'https://en.wiktionary.org/wiki/by_means_of', instID: null },
        { str: 'RNAi', classID: 'http://edamontology.org/topic_3523', instID: null,
          descr: 'RNA interference experiment.' }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 4, 5, 6 ] },
        { type: 'T', pos: [ 1, 3, 4 ] },
        { type: 'T', pos: [ 5, 7, 8 ] }
      ]
    },

    // --- Inspired by the GO-CAM data model.
    {
      terms: [
        { str: 'UV',
          classID: 'http://purl.obolibrary.org/obo/ZECO_0000214',
          instID: null,
          descr: 'ultraviolet light' },
        { str: 'causes',
          classID: 'http://purl.obolibrary.org/obo/RO_0002411',
          instID: null,
          dictID: 'http://data.bioontology.org/ontologies/OBOREL',
          descr: 'causally upstream of; a causation' },
        { str: 'NEDD4',
          classID: 'https://www.uniprot.org/uniprot/P46934',  /// 'UniProtKB:P46934'
          instID: null,
          dictID: 'https://www.uniprot.org',  /// 'http://golr-aux.geneontology.io'
          descr: 'NEDD4_HUMAN (P46934)' },
        { str: 'to ubiquitinate',
          classID: 'http://purl.obolibrary.org/obo/RO_0002480',
          instID: null,
          descr: 'ubiquitinates; a ubiquitination' },
        { str: 'RNA Polymerase II',
          classID: 'http://purl.obolibrary.org/obo/NCIT_C95948',
          instID: 'db-id225' },
        { str: 'in',
          classID: 'http://purl.obolibrary.org/obo/RO_0001025',
          instID: null,
          descr: 'has location; a \'being located in\'' },
        { str: 'nucleus',
          classID: 'http://purl.obolibrary.org/obo/NCIT_C13197',
          instID: null },
        { str: 'negatively regulating',
          classID: 'http://purl.obolibrary.org/obo/RO_0002212',
          instID: null,
          descr: 'negatively regulates; a negative regulation' },
        { str: 'it',
          classID: 'http://purl.obolibrary.org/obo/NCIT_C95948',
          instID: 'db-id229',
          parentID: 'db-id225',
          descr: 'Refers to (+creates new local context for) a: ' +
            'RNA Polymerase II' },
        { str: 'activates',
          classID: 'http://purl.obolibrary.org/obo/RO_0002406',
          instID: null,
          descr: 'directly activates; a direct activation' },
        { str: 'transcription',
          classID: 'http://purl.obolibrary.org/obo/NCIT_C17208',
          instID: null,
          descr: 'Transcription' }
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

    // --- VSM-template, based on MI2CAST and causalBuilder.
    { terms: [
        { queryOptions: { filter: { dictID: [
            'https://www.uniprot.org',
            'https://www.ebi.ac.uk/complexportal'
          ] } },
          placeholder: 'protein',
          editWidth: 70
        },
        { str: 'having modif.',
          classID: 'http://example.org/ID/has_biological_modification', instID: null
        },
        { queryOptions: {
            filter: {
              dictID: [
                'http://data.bioontology.org/ontologies/PSIMOD'
              ]
            },
            fixedTerms: [
              { id: 'http://purl.obolibrary.org/obo/MOD_00696',
                str: 'phosphorylated residue'
              }
            ]
          },
          placeholder: 'modification'
        },
        { str: 'at',
          classID: 'http://example.org/ID/is_located_at_sequence_position', instID: null
        },
        { queryOptions: { filter: { dictID: [
            'https://w3id.org/00'
          ] } },
          editWidth: 26,
          placeholder: 'pos'
        },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/MI',
            'http://data.bioontology.org/ontologies/OBOREL'
          ] } },
          placeholder: 'causal relation',
          editWidth: 90
        },
        { queryOptions: { filter: { dictID: [
            'https://www.ensembl.org',
            'http://www.ensemblgenomes.org',
            'https://www.rnacentral.org'
          ] } },
          placeholder: 'gene',
          editWidth: 70
        },
        { str: 'performing', classID: 'http://example.org/ID/has_location', instID: null },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/GO'
          ] } },
          placeholder: 'activity'
        },
        { str: 'has ref.', classID: 'http://example.org/ID/has_reference', instID: null },
        { queryOptions: { filter: { dictID: [
            'https://www.ncbi.nlm.nih.gov/pubmed'
          ] } },
          placeholder: 'reference',
          editWidth: 70
        },
        { str: 'is assessed by', classID: 'http://example.org/ID/is_assessed_by', instID: null },
        { queryOptions: { filter: { dictID: [
            'http://data.bioontology.org/ontologies/ECO'
          ] } },
          placeholder: 'evidence'
        }
      ],
      conns: [
        { type: 'T', pos: [ 2, 3, 4 ] },
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 6, 7, 8 ] },
        { type: 'T', pos: [ 0, 5, 6 ] },
        { type: 'T', pos: [ 5, 9, 10 ] },
        { type: 'T', pos: [ 5, 11, 12 ] }
      ]
    },

    // ---  Protein degradation
    { terms: [
        { str: 'Hsc70', classID: null, instID: null },
        { str: 'bound to', classID: null, instID: null },
        { str: 'CHIP', classID: null, instID: null },
        { str: 'ubiquitinates', classID: null, instID: null },
        { str: 'misfolded', classID: null, instID: null },
        { str: 'CFTR', classID: null, instID: null },
        { str: 'resulting in', classID: null, instID: null },
        { str: 'it', classID: null, instID: null, parentID: null },
        { str: 'binds to', classID: null, instID: null },
        { str: 'proteasome', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 5, -1, 4 ] },
        { type: 'T', pos: [ 0, 3, 5 ] },
        { type: 'T', pos: [ 7, 8, 9 ] },
        { type: 'T', pos: [ 3, 6, 8 ] },
        { type: 'R', pos: [ 7, 5 ] }
      ]
    },

    // --- Neuroscience.
    { terms: [
        { str: 'Brodmann Area 35', classID: null, instID: null,
          descr: 'Synonym: A35' },
        { str: 'plus', classID: 'http://example.org/ID/together_with', instID: null },
        { str: 'A36', classID: null, instID: null,
          descr: '= Brodmann Area 36' },
        { str: 'convergently', classID: null, instID: null },
        { str: 'project to', classID: null, instID: null },
        { str: 'Entorhinal Cortex Lateral Area layer II', classID: null, instID: null,
          descr: '= EC-LEA II',
          maxWidth: 200 },
        { str: 'plus', classID: 'http://example.org/ID/together_with', instID: null },
        { str: 'EC-LEA III', classID: null, instID: null,
          descr: '= Entorhinal Cortex Lateral Area layer III' },
        { str: 'in', classID: null, instID: null },
        { str: 'Rat', classID: 'http://purl.obolibrary.org/obo/NCIT_C14266', instID: null,
          descr: '= Rattus norvegicus' }
      ],
      conns: [
        { type: 'L', pos: [ 1, 0, 2 ] },
        { type: 'T', pos: [ 4, -1, 3 ] },
        { type: 'L', pos: [ 6, 5, 7 ] },
        { type: 'T', pos: [ 1, 4, 6 ] },
        { type: 'T', pos: [ 4, 8, 9 ] }
      ]
    },

    // --- Chemistry.
    { terms: [
        { str: 'acetaldehyde',      classID: 'CHEBI:15343', instID: null },
        { str: 'NAD+', style: 'u3', classID: 'CHEBI:57540', instID: null },
        { str: 'and',               classID: 'ex:unordered_list', instID: null },
        { str: 'H2O', style: 's1',  classID: 'CHEBI:15377', instID: null },
        { str: 'reversibly react to', classID: 'https://en.wikipedia.org/wiki/Reversible_reaction',
          instID: null,  descr: 'Synonyms: ⇄, ⇌, reversibly reacts to, reversible reaction.' },
        { str: 'acetate',           classID: 'CHEBI:30089', instID: null },
        { str: 'NADH',              classID: 'CHEBI:57945', instID: null },
        { str: 'and',               classID: 'ex:unordered_list', instID: null },
        { str: '2',                 classID: 'https://w3id.org/00/2e+0', instID: null },
        { str: 'H+', style: 'u1',   classID: 'CHEBI:15378', instID: null }
      ],
      conns: [
        { type: 'L', pos: [ 2, 0, 1, 3 ] },
        { type: 'T', pos: [ 9, -1, 8 ] },
        { type: 'L', pos: [ 7, 5, 6, 9 ] },
        { type: 'T', pos: [ 2, 4, 7 ] }
      ]
    },

    // --- Zoology
    { terms: [
        { str: 'non-dominant', classID: null, instID: null },
        { str: 'sexually mature', classID: null, instID: null },
        { str: 'wolf', classID: null, instID: null },
        { str: 'may', classID: null, instID: null },
        { str: 'leave', classID: null, instID: null },
        { str: 'natal pack', classID: null, instID: null },
        { str: 'in order to', classID: null, instID: null },
        { str: 'find', classID: null, instID: null },
        { str: 'mate', classID: null, instID: null },
        { str: 'and', classID: null, instID: null, dictID: null },
        { str: 'establish', classID: null, instID: null },
        { str: 'pack', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 2, -1, 1 ] },
        { type: 'T', pos: [ 2, -1, 0 ] },
        { type: 'T', pos: [ 4, -1, 3 ] },
        { type: 'T', pos: [ 2, 4, 5 ] },
        { type: 'T', pos: [ -1, 7, 8 ] },
        { type: 'T', pos: [ -1, 10, 11 ] },
        { type: 'L', pos: [ 9, 7, 10 ] },
        { type: 'T', pos: [ 4, 6, 9 ] }
      ]
    },

    // --- Finance
    { terms: [
        { str: 'in', classID: null, instID: null },
        { str: 'March 2020', classID: null, instID: null },
        { str: 'Goldman Sachs', classID: null, instID: null },
        { str: 'predicts', classID: null, instID: null },
        { str: 'U.S. GDP', classID: null, instID: null },
        { str: 'to shrink', classID: null, instID: null },
        { str: 'by', classID: null, instID: null },
        { str: 'nearly', classID: null, instID: null },
        { str: '5', classID: null, instID: null },
        { str: '%', classID: null, instID: null },
        { str: 'in', classID: null, instID: null },
        { str: 'Q2 2020', classID: null, instID: null },
        { str: 'due to', classID: null, instID: null },
        { str: 'COVID-19', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 4, 5, -1 ] },
        { type: 'T', pos: [ 2, 3, 5 ] },
        { type: 'T', pos: [ 3, 0, 1 ] },
        { type: 'T', pos: [ 8, -1, 7 ] },
        { type: 'T', pos: [ 9, -1, 8 ] },
        { type: 'T', pos: [ 5, 6, 9 ] },
        { type: 'T', pos: [ 5, 10, 11 ] },
        { type: 'T', pos: [ 5, 12, 13 ] }
      ]
    },

    // --- Finance 2
    { terms: [
        { str: 'Telia Co.', classID: null, instID: null },
        { str: 'acquiring', classID: null, instID: null },
        { str: 'Bonnier AB', classID: null, instID: null },
        { str: 'is investigated by', classID: null, instID: null },
        { str: 'EU', classID: null, instID: null },
        { str: 'as', classID: null, instID: null },
        { str: 'it', classID: null, instID: null, parentID: null },
        { str: 'may', classID: null, instID: null },
        { str: 'increase', classID: null, instID: null },
        { str: 'price', classID: null, instID: null },
        { str: 'of', classID: null, instID: null },
        { str: 'TV service', classID: null, instID: null },
        { str: 'in', classID: null, instID: null },
        { str: 'Sweden', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 1, 3, 4 ] },
        { type: 'T', pos: [ 8, -1, 7 ] },
        { type: 'T', pos: [ 11, 12, 13 ] },
        { type: 'T', pos: [ 9, 10, 11 ] },
        { type: 'T', pos: [ 6, 8, 9 ] },
        { type: 'T', pos: [ 3, 5, 8 ] },
        { type: 'R', pos: [ 6, 1 ] }
      ]
    },

    // --- Ecology
    ...[]  ||
    { terms: [
        { str: 'Journey', classID: null, instID: null },
        { str: 'leaves', classID: null, instID: null },
        { str: 'Imnaha Pack', classID: null, instID: null },
        { str: 'near', classID: null, instID: null },
        { str: 'Joseph, Wallowa', classID: null, instID: null },
        { str: 'in', classID: null, instID: null },
        { str: 'Sept 2011', classID: null, instID: null },
        { str: 'presumably', classID: null, instID: null },
        { str: 'in order to', classID: null, instID: null },
        { str: 'find', classID: null, instID: null },
        { str: 'mate', classID: null, instID: null },
        { str: 'results in', classID: null, instID: null },
        { str: 'he', classID: null, instID: null, parentID: null },
        { str: 'settles', classID: null, instID: null },
        { str: 'with', classID: null, instID: null },
        { str: 'mate', classID: null, instID: null },
        { str: 'from', classID: null, instID: null },
        { str: 'northeastern', classID: null, instID: null },
        { str: 'Oregon', classID: null, instID: null },
        { str: 'in', classID: null, instID: null },
        { str: 'Medford, Oregon', classID: null, instID: null },
        { str: 'in', classID: null, instID: null },
        { str: 'ca.', classID: null, instID: null },
        { str: '2014', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 1, 3, 4 ] },
        { type: 'T', pos: [ 1, 5, 6 ] },
        { type: 'T', pos: [ 8, -1, 7 ] },
        { type: 'T', pos: [ -1, 9, 10 ] },
        { type: 'T', pos: [ 1, 8, 9 ] },
        { type: 'T', pos: [ 12, 13, -1 ] },
        { type: 'R', pos: [ 12, 0 ] },
        { type: 'T', pos: [ 13, 14, 15 ] },
        { type: 'T', pos: [ 18, -1, 17 ] },
        { type: 'T', pos: [ 15, 16, 18 ] },
        { type: 'T', pos: [ 13, 19, 20 ] },
        { type: 'T', pos: [ 23, -1, 22 ] },
        { type: 'T', pos: [ 13, 21, 23 ] },
        { type: 'T', pos: [ 1, 11, 13 ] }
      ]
    },

    // ---
    ...[]  ||
    { terms: [
      ],
      conns: [
      ]
    },


    // --- LAST = Test Example:  Demo with all VSM features, as a test.
    { terms: [
        { str: 'Test', classID: 'ex:123', instID: 'dbid45', //minWidth: 23,
          queryOptions: { fixedTerms: [{ id:'PRS:0001' }, { id:'BIO:0010' }] },
          minWidth: 20, maxWidth: 80, editWidth: 55,
          placeholder: 'person'
        },
        { str: 'activates', classID: null, instID: null,
          isFocal: true },
        { str: 'isβiuabcdefg', style: 'b1;i0-2;s1;u4;s5-11;s6-11;u7-11;u8-9',
          classID: null, instID: null,
          queryOptions: { sort: { dictID: ['http://example.org/BIO'] } } },
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
    }

    /* // (Useful during the development of sketchBox-style SVG output).
    ,{ terms: [
        { str: 'a', classID: null, instID: null, parentID: null },
        { str: 'h', classID: null, instID: null },
        { str: 'p', classID: null, instID: null },
        { str: 'i', classID: null, instID: null },
        { str: 'w', classID: null, instID: null }
      ],
      conns: [
        { type: 'T', pos: [ 0, 1, 2 ] },
        { type: 'T', pos: [ 1, 3, 4 ] }
      ]
    }
    /**/

  ];

  if (!opt.addTheTestExample)  vsmExamples.pop();  // Removes the test-example.

  return vsmExamples;
}
