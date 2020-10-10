// ---------- DEMO DICTIONARY DATA ----------

function demoDictData(opt) {
  opt = {
    useTweaks: false,
    ...opt
  };

  var useTweaks = opt.useTweaks;


  return {
    dictData: [
      { id: 'VAR',  abbrev: 'Varia',  name: 'Various English words',  entries: [
        { id: 'VAR:0045', terms: [{str: 'about'}] },
        { id: 'VAR:0082', terms: [{str: 'after'}] },
        { id: 'VAR:0036', terms: [{str: 'all'}] },
        { id: 'VAR:0080', terms: [{str: 'also'}] },
        { id: 'VAR:0095', terms: [{str: 'any'}] },
        { id: 'VAR:0017', terms: [{str: 'as'}] },
        //{ id: 'VAR:0081', terms: [{str: 'back'}] },
        //{ id: 'VAR:0094', terms: [{str: 'because'}] },
        { id: 'VAR:0024', terms: [{str: 'by'}] },
        //{ id: 'VAR:0053', terms: [{str: 'can'}] },
        //{ id: 'VAR:0076', terms: [{str: 'come'}] },
        //{ id: 'VAR:0067', terms: [{str: 'could'}] },
        { id: 'VAR:0098', terms: [{str: 'day'}] },
        { id: 'VAR:0019', terms: [{str: 'do'}] },
        //{ id: 'VAR:0088', terms: [{str: 'first'}] },
        { id: 'VAR:0025', terms: [{str: 'from'}] },
        { id: 'VAR:0047', terms: [{str: 'get'}] },
        { id: 'VAR:0097', terms: [{str: 'give'}] },
        { id: 'VAR:0049', terms: [{str: 'go'}] },
        { id: 'VAR:0065', terms: [{str: 'good'}] },
        { id: 'VAR:0009', terms: [{str: 'have'}] },
        { id: 'VAR:0062', terms: [{str: 'into'}] },
        //{ id: 'VAR:0057', terms: [{str: 'just'}] },
        { id: 'VAR:0059', terms: [{str: 'know'}] },
        { id: 'VAR:0054', terms: [{str: 'like'}] },
        { id: 'VAR:0074', terms: [{str: 'look'}] },
        { id: 'VAR:0052', terms: [{str: 'make'}] },
        { id: 'VAR:0099', terms: [{str: 'most'}] },
        { id: 'VAR:0092', terms: [{str: 'new'}] },
        { id: 'VAR:0056', terms: [{str: 'no'}] },
        { id: 'VAR:0013', terms: [{str: 'not'}] },
        { id: 'VAR:0073', terms: [{str: 'now'}] },
        { id: 'VAR:0014', terms: [{str: 'on'}] },
        { id: 'VAR:0035', terms: [{str: 'one'}] },
        { id: 'VAR:0075', terms: [{str: 'only'}] },
        { id: 'VAR:0031', terms: [{str: 'or'}] },
        { id: 'VAR:0078', terms: [{str: 'over'}] },
        { id: 'VAR:0061', terms: [{str: 'person'}] },
        { id: 'VAR:0066', terms: [{str: 'some'}] },
        { id: 'VAR:0060', terms: [{str: 'take'}] },
        { id: 'VAR:0079', terms: [{str: 'think'}] },
        { id: 'VAR:0055', terms: [{str: 'time'}] },
        { id: 'VAR:0084', terms: [{str: 'two'}] },
        { id: 'VAR:0042', terms: [{str: 'up'}] },
        //{ id: 'VAR:0093', terms: [{str: 'want'}] },
        //{ id: 'VAR:0090', terms: [{str: 'way'}] },
        { id: 'VAR:0087', terms: [{str: 'work'}] },
        //{ id: 'VAR:0063', terms: [{str: 'year'}, {str: 'years'}] },
        { id: 'VAR:0063', terms: [{str: 'year'}] },
        { id: 'VAR:0101', descr: 'to eat',
          terms: [{str: 'eat'}, {str: 'eats'}, {str: 'eating'}] },
        { id: 'VAR:0069',  descr: 'to see',
          terms: [{str: 'see'}, {str: 'sees'}, {str: 'to see'}] },
        { id: 'VAR:0028',  descr: 'to say',
          terms: [{str: 'say'}, {str: 'says'}, {str: 'to say'}] },
        { id: 'VAR:0107', terms: [{str: 'spoon'}], descr: 'utensil<i class="sep"></i><i class="fas fa-utensils"></i>' },
        { id: 'VAR:0207', terms: [{str: 'spoon'}], descr: 'to cuddle like two spoons<i class="sep"></i><i class="fas fa-heart"></i>' },
        { id: 'VAR:0108', terms: [{str: 'fork' }], descr: 'utensil<i class="sep"></i><i class="fas fa-utensils"></i>' },
        { id: 'VAR:0208', terms: [{str: 'fork' }], descr: 'GitHub<i class="sep"></i><i class="fas fa-code-branch"></i>' },
        { id: 'VAR:0109', terms: [{str: 'knife'}], descr: 'utensil<i class="sep"></i><i class="fas fa-utensils"></i>' },
        { id: 'VAR:0214', terms: [{str: 'burnt'}] },
        { id: 'VAR:0215', terms: [{str: 'spicy'}] },
        { id: 'VAR:0105', descr: 'to use', z: { tweakID: 'EN:0710' },
          terms: [
            { str: 'with', descr: useTweaks ? '= using' : 'using' },
            //{ str: 'to use' },
            { str: 'use' },
            { str: 'uses' },
            { str: 'using' },
            { str: 'use of' },
          ]
        },
        { id: 'VAR:0106', descr: 'to be accompanied by', z: { tweakID: 'EN:1105' },
          terms: [
            { str: 'with', descr: useTweaks ? '= accompanied by' : 'accompanied by' },
            { str: 'accompanied by' },
            { str: 'is accompanied by' }
          ]
        },
        { id: 'VAR:0020', descr: 'associated with', terms: [{str: 'at'}] },
        { id: 'VAR:0007', descr: 'to be located in', terms: [
          {str: 'in', style: ''}, {str: 'is located in'}, {str: 'located in'},
          {str: 'located at'}, {str: 'at'} ]
          ///, {str: 'locatedness-inside', style: 'i'}
        },
        { id: 'VAR:0115', descr: 'to happen in time period',
          terms: [{str: 'in'}, {str: 'during'}] },
        { id: 'VAR:0116', descr: 'to happen at timepoint',
          terms: [{str: 'at', descr: 'happens at timepoint'}] },
        { id: 'VAR:0111', descr: 'to pertain to',
          terms: [{str: 'in', descr: 'pertains to'}] },
        { id: 'VAR:0005', descr: 'a set of items',
          terms: [{str: 'and'}]
        },
        { id: 'VAR:0112', descr: 'a list where item order is important',
          terms: [{str: 'ordered-and', style: 'i0-8'}] },
        { id: 'VAR:0002', descr: 'to be',
          terms: [
            {str: 'to be'},
            {str: 'being'},
            {str: 'is', descr: 'to be, in 3rd-person form'},
            {str: 'are', descr: 'to be, in plural form'}
          ]
        },
        { id: 'VAR:0123', descr: 'belonging to', terms: [{str: 'of'}, {str: '\'s'}] },
        //{ id: 'VAR:0003', descr: 'having purpose', terms: [{str: 'to'}, {str: 'for'}] },
        { id: 'VAR:0126', terms: [{str: 'book'}] },
        //{ id: 'VAR:0131',
        //  descr: 'Single-term relation concept, for the \'if ... then ...\' ' +
        //    'construct used in natural language',
        //  terms: [{str: 'if-then'}]
        //},
        //{ id: 'VAR:0132',
        //  descr: '= \'if not {subject} then {object}\'',
        //  terms: [{str: 'else'}]
        //},
        { id: 'VAR:0133', terms: [{str: 'has'}] },
        //{ id: 'VAR:0141', descr: 'being located amongst',
        //  terms: [{str: 'between'}, {str: 'is between'}, {str: 'are between'}] },
        { id: 'VAR:0141', descr: 'being located amongst', terms: [{str: 'between'}] },
        //{ id: 'VAR:0142', descr: 'the location amongst some things',
        //  terms: [{str: 'between'}]
        //},
        { id: 'VAR:2001', terms: [{ str: 'blue' }] },

        { id: 'VAR:5103', descr: 'someone with little courage', z: { tweakID: 'EN:1510' },
          terms: [
            { str: 'coward' },
            { str: 'chicken', style: useTweaks ? 'i' : 'i',
              descr: useTweaks ? 'fearful person' : '\'coward\'' }
          ]
        },
        { id: 'VAR:5015', descr: 'Computer science, Information Technology',
          terms: [{str: 'IT'}] },
        { id: 'VAR:5016', descr: 'to turn on a device',
          terms: [
            ///{ str: 'activate' },
            { str: 'activates' }
          ],
          z: { extraChar: '⍾' }
        },
        { id: 'VAR:5017', terms: [{str: 'device'}] },
        //{ id: 'VAR:5018', descr: 'is subclass of',
        //  terms: [{str: 'is subclass of'}, {str: 'is a'}] },
        { id: 'VAR:5021', descr: 'percent',
          terms: [{str: 'percent'}, {str: '%'}, {str: 'percentage'}] },
        { id: 'VAR:5093', descr: 'unit of acceleration',
          terms: [{str: 'm/s2', style: 'u3'}] },
        //{ id: 'VAR:5151', descr: 'the mathematical operator \'for all\'',
        //  terms: [{str: '∀'}, {str: 'for all'}] },
        //{ id: 'VAR:5153', descr: 'the mathematical operator \'there exists\'',
        //  terms: [{str: '∃'}, {str: 'exists'}] },
        //{ id: 'VAR:5011',
        //  terms: [
        //    {str: 'HCO3- ⇌ CO32- + H+', style: 's3;u4;s10;u11-13;u17'}
        //  ],
        //  descr: 'step 2 of carbonic acid ionization reaction'
        //},
        { id: 'VAR:0256',
          descr: 'Visual Syntax Method, a way to represent ' +
            'contextualised information, so it is manageable by ' +
            'both humans and computers',
          terms: [{str: 'VSM'}]
        },
      ]},

      { id: 'PRSNS', abbrev: 'Persons', name: 'Person Names', entries: [
        { id: 'PRS:0001', terms: [{str: 'Alice'}] },
        { id: 'PRS:0002', terms: [{str: 'Bob'}] },
        { id: 'PRS:0003', terms: [{str: 'Clara'}] },
        { id: 'PRS:0004', terms: [{str: 'David'}] },
        { id: 'PRS:0005', terms: [{str: 'Eve'}] },
        //{ id: 'PRS:0006', terms: [{str: 'Frank'}] },
        { id: 'PRS:0007', terms: [{str: 'Greta'}] },
        { id: 'PRS:0008', terms: [{str: 'Heidi'}] },
        { id: 'PRS:0010', terms: [{str: 'John'}],
          //descr: useTweaks ? '' : 'example John',
          z: { tweakID: 'ID:0912' } },
        { id: 'PRS:0009', terms: [{str: 'Jos'}],  z: { tweakID: 'ID:1005' }
        },
        { id: 'PRS:0011', terms: [{str: 'Joy'}],  z: { tweakID: 'ID:2209' },
          //descr: 'Dr.'
        },
        { id: 'PRS:0012', terms: [{str: 'Robert'}] },
        { id: 'PRS:0013', terms: [{str: 'Robin'}] },
        { id: 'PRS:0014', terms: [{str: 'Taylor'}] },
        { id: 'PRS:0015', terms: [{str: 'Tom'}] },
        //{ id: 'PRS:0016', terms: [{str: 'Wally'}] },
        //{ id: 'PRS:0017', terms: [{str: 'Walter'}] },
        { id: 'PRS:0018', terms: [{str: 'Will'}] },
        //{ id: 'PRS:0019', terms: [{str: 'William'}] },
        //{ id: 'PRS:0020', terms: [{str: 'Wilson'}] },
        { id: 'PRS:0021', descr: 'Steven Vercruysse, creator of VSM',
          terms: [{str: 'Steven'}] },
      ]
      .map(o => {
        //if (!useTweaks) { o.descr = o.descr || ('example ' + o.terms[0].str) }
        return o;
      })},

      { id: 'http://example.org/BIO', abbrev: 'Biology', name: 'Biological concepts', entries: [
        { id:'BIO:0010', terms: [{str: 'Ca2+', style: 'u2-4'}] },
        { id:'BIO:0011', terms: [{str: 'Na+Cl-', style: 'u2;u5'}], descr: 'dissolved salt' },
        { id:'BIO:0001', terms: [{str: 'beta-Carotene'}, {str: 'β-Carotene'}] },
        { id:'BIO:0002', descr: 'the Human gene ICER', terms: [{str: 'ICER'}] },
        //{ id:'BIO:0003', descr: 'the Human gene cdc2',
        //  terms: [{str: 'cdc2', style: 'i'}],  ///, {str: 'cdc'}, {str: 'KRP5'},
        //  z: {species: 'Human'}
        //},
        //{ id:'BIO:0903', descr: 'the Mouse gene cdc2', terms: [{str: 'cdc2'}] },
        { id:'BIO:0014',
          descr: 'to activate a biomolecule',
          terms: [
            {str: 'activates'},
            //{str: 'activation'},
            {str: 'activation of', style: 'i10-13'}
          ],
        },
        { id:'BIO:0015', terms: [{str: 'inhibits'}] },
        { id:'BIO:0016', terms: [{str: 'regulates'}, {str: 'regulation'}] },
        { id:'BIO:0017', terms: [{str: 'has function'}] },
        { id:'BIO:0018', terms: [{str: 'according to'}] },
        { id:'BIO:0019', terms: [
          {str: 'binds to'},
          {str: 'binds'},
          {str: 'bind'},
          {str: 'bound to'}
        ]},
        { id:'BIO:0030',
          descr: 'addition of a ubiquitin-molecule tag to a protein, ' +
            'which marks it for degradation by a proteasome',
          terms: [{str: 'ubiquitinates'}]
        },
        { id:'BIO:0042',
          descr: useTweaks ? 'the animal' : 'animal', z: { tweakID: 'BIO:0309' },
          terms: [{str: 'chicken'}] },
        { id:'BIO:0101', descr: 'example molecule A', terms: [{str: 'A'}] },
        { id:'BIO:0102', descr: 'example molecule B', terms: [{str: 'B'}] },
        //{ id:'BIO:0103', descr: 'example molecule C', terms: [{str: 'C'}] },
        { id:'BIO:0104', descr: 'example molecule D', terms: [{str: 'D'}] },
        { id:'BIO:0124', descr: 'example molecule X', terms: [{str: 'X'}] },
        { id:'BIO:0131', descr: 'example protein A',  terms: [{str: 'protein A'}] },
        { id:'BIO:0132', descr: 'example protein B',  terms: [{str: 'protein B'}] },
        { id:'BIO:0133', descr: 'example location C', terms: [{str: 'location C'}] },
        //{ id:'BIO:0151', descr: 'the blade of a plant leaf (Plant Ontology term)',
        //  terms: [{str: 'leaf lamina'}] },
        //{ id:'BIO:0152', descr: 'a plant leaf shape variation (PATO term)',
        //  terms: [{str: 'twisted'}] },

        { id: 'http://purl.obolibrary.org/obo/MOD_00696',
          terms: [ { str: 'phosphorylated residue' } ] }
      ]},

      // These come in addition to vsm-dictionary's auto-generated numbers:
      { id: '00', abbrev: 'Numbers', name: 'Numbers', entries: [
        //{ id: '00:5e+0',   terms: [{str:  '5'}, {str: 'five'}] },
        { id: '00:1.2e+1', terms: [{str: '12'}, {str: 'twelve'}, {str: 'dozen'}],
          descr: 'the amount of twelve' },
        //{ id: '00:4e+1',   terms: [{str: '40'}, {str: 'forty'}] },
      ]},

      { id: 'NEW', abbrev: 'New', name: 'New Concepts', entries: [] },


      // Define dictionaries for terms used in examples, so dict-info can be
      // auto-filled when a term is hovered (and if it has a dictID in the JSON).
      { id: 'https://orcid.org', abbrev: 'ORCID',
        name: 'Open Researcher & Contr. IDs',
        entries: [
          ///{ id: 'https://orcid.org/0000-0002-1175-2668', terms: [ { str: 'John' } ], descr: 'Dr.' }
        ] },
      { id: 'http://data.bioontology.org/ontologies/ECO', abbrev: 'ECO',
        name: 'Evidence & Conclusion Ontology' },
      { id: 'http://data.bioontology.org/ontologies/FOODON', abbrev: 'FOODON',
        name: 'Field to Fork Ontology' },
      { id: 'http://data.bioontology.org/ontologies/GO', abbrev: 'GO',
        name: 'Gene Ontology' },
      { id: 'http://data.bioontology.org/ontologies/MI', abbrev: 'MI',
        name: 'Molecular Interactions Controlled Vocabulary' },
      { id: 'http://data.bioontology.org/ontologies/NCBITaxon', abbrev: 'NCBITaxon',
        name: 'NCBI organismal classification' },
      { id: 'http://data.bioontology.org/ontologies/NCIT', abbrev: 'NCIT',
        name: 'NCI Thesaurus' },
      { id: 'http://data.bioontology.org/ontologies/PATO', abbrev: 'PATO',
        name: 'Phenotype And Trait Ontology' },
      { id: 'http://data.bioontology.org/ontologies/PHI', abbrev: 'PHI-base Ontology',
        name: 'Pathogen-Host Interaction database Ontology used by Ensembl' },
      { id: 'http://data.bioontology.org/ontologies/PO', abbrev: 'PO',
        name: 'Plant Ontology' },
      { id: 'http://data.bioontology.org/ontologies/PSIMOD', abbrev: 'MOD',
        name: 'Protein Modification Ontology' },
      { id: 'http://data.bioontology.org/ontologies/RO', abbrev: 'RO',
        name: 'Relations Ontology' },
      { id: 'http://data.bioontology.org/ontologies/ZECO', abbrev: 'ZECO',
        name: 'Zebrafish Experimental Conditions Ontology' },
      { id: 'https://www.uniprot.org', abbrev: 'UniProt',
        name: 'The Universal Protein resource' },
      { id: 'https://www.rnacentral.org', abbrev: 'RNAcentral',
        name: 'The non-coding RNA sequence database' },
      { id: 'https://www.ebi.ac.uk/complexportal', abbrev: 'CPX',
        name: 'Complex Portal' },
      { id: 'https://www.ensembl.org', abbrev: 'Ensembl',
        name: 'Ensembl genome data for vertebrates' },
      { id: 'http://www.ensemblgenomes.org', abbrev: 'EnsemblGenomes',
        name: 'Ensembl genome data for non-vertebrates' },
      { id: 'https://www.araport.org', abbrev: 'ARAPORT',
        name: 'Arabidopsis Information Portal' },
      { id: 'http://edamontology.org', abbrev: 'EDAM',
        name: 'bioinformatics operations, types of data, data formats, identifiers, and topics' },
      { id: 'https://www.ncbi.nlm.nih.gov/pubmed', abbrev: 'PubMed',
        name: 'MEDLINE citations' },
      { id: 'https://en.wiktionary.org', abbrev: 'WIKT-EN',
        name: 'Wiktionary, English' },
      { id: 'https://en.wikipedia.org', abbrev: 'WIKI-EN',
        name: 'Wikipedia, English' },
      { id: 'http://wordvis.com', abbrev: 'WORDNET-EN',
        name: 'WordNet, English' },
      { id: 'https://w3id.org/00', abbrev: '00',
        name: 'The Generative Controlled Vocabulary for Real Numbers' },
      { id: 'http://127.0.0.1', abbrev: 'LocalCV',
        name: 'Platform-local dictionary' },
      { id: 'http://example.org', abbrev: 'EX',
        name: 'Example dictionary' },
      { id: 'http://ont.ex', abbrev: 'OntEX',
        name: 'Example ontology' },

    ],

    refTerms: [
      'it', 'this', 'that', 'they', 'these', 'them'
    ]
  };
}
