# Datasets

The sound-sketch datasets from Study 1.1 and 2.1 are saved in JSON format with the following data structure:

    {
        participant1_id: { 
            sound1_id: [...], 
            sound2_id: [...], 
            sound3_id: [...], 
            ...},
        participant2_id: { 
            sound1_id: [...], 
            sound2_id: [...], 
            sound3_id: [...], 
            ...}, 
        .
        .
        .
    }

The sketch for a sound is saved as nested arrays in the following format:

    #Sketch array
    [#Stroke 1 array
        [#Recorded stroke points
            [x0,x1,x2,...], #x positions
            [y0,y1,y2,...], #y positions
            [t0,t1,t2,...], #timestamps
        ],
        #More Stroke arrays
        [...],
        [...],
        ...
    ]

## Study 1.1
Each sound was repeated in this study. The dataset therefore features an entry that is named after the sound (e.g. *crackles*) and an entry for the same sound with a trailing letter *B* (e.g. *crackles B*) marking the second time that sound was played.

## Study 2.1
Next to the sketches created on the sounds, the dataset features 2 test sketches (with the keys *calmSound* and *noisySound*) that each participant created. The keys for each sound-sketch are in the format *drawingInterface_ + sound ID* (e.g. *drawingInterface_a7ecc7b965e2e7888e2df382514ad101*). In addition, sketches for an attention test that asked participants to draw the number 4 are saved under the key *drawingInterface_attentionTest*. 