window.onload = function() {  
    /* Helper functions */
    function checkSequence(sequence) {
        var seq_len = sequence.length;
        clearFields(['check_error', 'check_result'], []);
        if (seq_len == 0) {
            addText({'check_error': 'OOOPS! There is no sequence!<br>'});
            return(false);
        }

        //Checks that the sequence has only the correct bases:
        var regex = sequence.match(/[atcgu]/gi);
        if (regex !== null) {
            if (regex.length == seq_len) {
                //Checks that the sequence is not a mix of DNA and RNA:
                if ((sequence.indexOf('u') > -1) && (sequence.indexOf('t') > -1)) {
                    addText({'check_error':'It seems that you pasted a mix of DNA and RNA...<br>'});
                    return(false);
                }
                else if (sequence.toLowerCase().indexOf('u') > -1) {
                    return('RNA');
                }
                return('DNA'); //If the sequence does not have Us or Ts it will return a DNA chain as default
            }
        }
        return(false);
    }

    function clearFields(class_el, buttons, all = false) {
        if (all === true) {
            var clearableElements = document.getElementsByClassName('clearable');
            var buttons = document.getElementsByClassName('buttons');
        }
        else {
            var clearableElements = document.getElementsByClassName(class_el);
            var buttons = document.getElementsByClassName(buttons);
        }
        for (var i=0; i<buttons.length; i++) {
            buttons[i].disabled = false;
        }
        for (var i=0; i<clearableElements.length; i++) {
            var element = clearableElements[i];
            if (element.innerHTML !== null) {
                removeText(element);
            }
        }
    }

    function getPercentage(base, total) {
        var percentage = ((base/total) * 100).toFixed(2);
        if (percentage == NaN) {
            return('Error');
        }
        return percentage;    
    }

    function removeText(element) {
            element.innerHTML = '';
    }

    function addText(list) {
        for (var key in list) {
            document.getElementById(key).innerHTML += list[key];
        };     
    }

    function translateToDNA(codon) {
        return(codon.replace(/u/gi,"t"));
    }

    function comp_base(base) {
        var compl_bases = {
            'A': 'T',
            'T': 'A',
            'U': 'U',
            'C': 'G',
            'G': 'C',
        };
        if (base in compl_bases) {
            return(compl_bases[base]);
        }
    }    

    function trcodon(co, abb_one) {
        co = translateToDNA(co); // Makes sure the current codon is DNA type by changing the potential Us to Ts
        var codon_aa = {
            'atg': ['Met', 'M'],
            'ttt': ['Phe', 'F'], 'ttc': ['Phe', 'F'],
            'tta': ['Leu', 'L'], 'ttg': ['Leu', 'L'], 'ctt': ['Leu','L'], 'ctc': ['Leu', 'L'], 'cta' : ['Leu', 'L'], 'ctg': ['Leu', 'L'],
            'att': ['Ile', 'I'], 'atc':['Ile', 'I'], 'ata': ['Ile', 'I'],
            'gtt': ['Val', 'V'], 'gtc': ['Val', 'V'], 'gta': ['Val', 'V'], 'gtg': ['Val', 'V'],
            'tct': ['Ser', 'S'], 'tcc': ['Ser', 'S'], 'tca': ['Ser', 'S'], 'tcg': ['Ser', 'S'], 'agt': ['Ser', 'S'], 'agc': ['Ser','S'],
            'cct': ['Pro', 'P'], 'ccc': ['Pro', 'P'], 'cca': ['Pro', 'P'], 'ccg': ['Pro', 'P'],
            'act': ['Thr', 'T'], 'acc': ['Thr', 'T'], 'aca': ['Thr', 'T'], 'acg': ['Thr', 'T'],
            'gct': ['Ala', 'A'], 'gcc': ['Ala', 'A'], 'gca': ['Ala', 'A'], 'gcg': ['Ala', 'A'],
            'tat': ['Tyr', 'Y'], 'tac': ['Tyr', 'Y'],
            'cat': ['His', 'H'], 'cac': ['His', 'H'],
            'caa': ['Gln', 'Q'], 'cag': ['Gln', 'Q'],
            'aat': ['Asn', 'N'], 'aac': ['Asn', 'N'],
            'aaa': ['Lys', 'K'], 'aag': ['Lys', 'K'],
            'gat': ['Asp', 'D'], 'gac': ['Asp', 'D'],
            'gaa': ['Glu', 'E'], 'gag': ['Glu', 'E'],
            'tgt': ['Cys', 'C'], 'tgc': ['Cys', 'C'],
            'tgg': ['Trp', 'W'], 
            'cgt': ['Arg', 'R'], 'cgc': ['Arg', 'R'], 'cga': ['Arg', 'R'], 'cgg': ['Arg', 'R'], 'aga': ['Arg', 'R'], 'agg': ['Arg', 'R'],
            'ggt': ['Gly', 'G'], 'ggc': ['Gly', 'G'], 'gga': ['Gly', 'G'],'ggg': ['Gly', 'G'],
            'taa': ['STOP', '<span class="hl">STP</span>'], 'tag': ['STOP', '<span class="hl">STP</span>'], 'tga': ['STOP', '<span class="hl">STP</span>'],
        };
        if (co in codon_aa) {
            if (abb_one === false) {
                return(codon_aa[co][0]);
            }
            return(codon_aa[co][1]);    
        }
        else {
            return('XXX');
        }
    }

    function translateToProtein(index, seq, abb_one) {
        var protein = '';
        var len = seq.length;
        for (index; index < len - 3; index+=3) {
            var co = seq.substring(index, index + 3); // co = codon
            protein += trcodon(co, abb_one);
            protein += '-';            
        }
        co = seq.substring(index, len);
        protein += trcodon(co, abb_one);
        return(protein);
    }

    function hasStop (sequence) {
        stops = ['taa', 'tag', 'tga'];
        for (var i = 0; i<stops.length; i++) {
            var stop = sequence.indexOf(stops[i]);
            if (stop) {
                var orf = sequence.substring(0, stop + 3);
                if (orf.length % 3 == 0) { //to check the stop codon is in the same reading frame that the start codon
                    return sequence.substring(0, stop + 3);
                } 
            }   
        }
        return false;
    }

    // Cleans all fields and re-enables buttons after there is a change inside the sequence box
    document.getElementById('sequence').onchange = function() {
        clearFields(elements = '', buttons = '', all = true);
    }

    // Function that will check the sequence pasted and, if valid, will inform the user if it is a DNA or a RNA chain.
    document.getElementById('sequence_check').onclick = function() {
        document.getElementById('sequence_check').disabled = true;
        var sequence = document.getElementById('sequence').value;
        var isSeqValid = checkSequence(sequence);
        if (isSeqValid) {
            if (isSeqValid === 'DNA') {
                addText({
                    'check_result': 'Your sequence is valid, you are ready to go!. Sequence type: <em>DNA</em>',
                });
                return true;
            }
            if (isSeqValid === 'RNA') {
                addText({'check_result': 'Your sequence is valid, you are ready to go!. Sequence type: <em>RNA</em>'});
                return true;
            }
        }
        addText({'check_error': 'Invalid sequence'});
    }

    // Clears all parameters entered
    document.getElementById('clear_all').onclick = function() {
        clearFields(elements ='', buttons= '', all = true);
    }

    // Base counter function 
    document.getElementById('bc_button').onclick = function() {
        document.getElementById('bc_button').disabled = true;  
        var $sequence = document.getElementById('sequence').value;
        var validSeq = checkSequence($sequence);
        if (! validSeq) {
            addText({'count_error': 'Sorry, invalid sequence'});
            return;
        }
        $seq = $sequence.toUpperCase();
        var A=0;
        var C=0;
        var T=0;
        var G=0;
        var U=0;
        var total=$seq.length;
        for (var i=0; i<total; i++) {
            var ch=$seq.charAt(i);
            if(ch=="A") {
                A++;
            }
            else if(ch=="C") {
                C++;
            }
            else if(ch=="G") {
                G++;
            }
            else if(ch=="T"){
                T++;
            }
            else if(ch=="U"){
                U++;
            }
        }
        var p_A = getPercentage(A, total);
        var p_C = getPercentage(C, total);
        var p_G = getPercentage(G, total);
        var p_T = getPercentage(T, total);
        var p_U = getPercentage(U, total);
        var elements = {
            'A': A,
            'C': C,
            'G': G,
            'T': T,
            'U': U,
            'N': total,
            'perc_A': p_A + ' %',
            'perc_C': p_C + ' %',
            'perc_T': p_T + ' %',
            'perc_G': p_G + ' %',
            'perc_U': p_U + ' %',
            'perc_N': '100.00 %',
        }
        addText(elements);
        return true;
    };

    // Function that searchs for the sub-sequence 
    document.getElementById('subseq_button').onclick = function () {
        document.getElementById('subseq_button').disabled = true;
        var sequence = document.getElementById('sequence').value;
        var subseq= document.getElementById('ss').value;
        if (! checkSequence(sequence)) {
            addText({'ss_error': 'Your sequence is not valid'});
            return false;
        }
        if (! checkSequence(subseq)) {
            addText({'ss_error': 'Your sub-sequence was not valid'});
            return false;
        }
        sequence = sequence.toUpperCase();
        subseq = subseq.toUpperCase();
        var pos_list = [];
        var position = sequence.indexOf(subseq);
        if (position === -1) {
            addText({'position': ' <em>Sorry!</em> I could not find your sub-sequence :( '});
            return false;
        }
        var subseq_len = subseq.length;
        while (position !== -1) {
            pos_list.push(position);
            position = sequence.indexOf(subseq, position + subseq_len);
        }
        var new_seq = sequence.substring(0, pos_list[0]);
        var initial = 0;   // tracks the initial position of the rest of the sequence
        var new_seq = '';
        for (var i = 0; i < pos_list.length; i++) {
            var end = pos_list[i] + subseq_len; 
            new_seq += sequence.substring(initial, pos_list[i]);
            var highlighted = sequence.substring(pos_list[i], end);
            new_seq = new_seq + '<span id="highlight">' + highlighted + '</span>';
            initial = end;
        }
        new_seq += sequence.substring(end, sequence.length);
        addText({'position': pos_list});
        addText({'highlighted_seq': new_seq});
        addText({'repetitions': pos_list.length});
    };
    //Clears the written fields when the user changes the subsequence
    document.getElementById('ss').onchange = function() {
        clearFields('subseq_clear', 'ss_btn_clear');
    }

    // Converts the DNA chain into a RNA one, exchanging thymine for uracil
    document.getElementById('conv_button').onclick = function () {
        document.getElementById('conv_button').disabled = true;
        var seq = document.getElementById('sequence').value;
        if (! checkSequence(seq)) {
            addText({'conv_error': 'OOPS! The sequence you pasted is not valid'});
            return;
        }
        if (checkSequence(seq) == 'RNA') { //Checks whether the sequence provided is DNA or RNA and translates to the contrary type
            var conv_seq = translateToDNA(seq);
        }
        else {
            var conv_seq = seq.replace(/T/ig,"U");
        }
        addText({'rna_seq': conv_seq.toUpperCase()});
    };

    // Automatically gives the user the complementary sequence of a DNA chain
    document.getElementById('compl_button').onclick = function () {
        document.getElementById('compl_button').disabled = true;
        var seq = document.getElementById('sequence').value;
        var compl_seq = "";        
        var N = seq.length;
        if (! checkSequence(seq)) {
            addText({'compl_error': 'ERROR! Your sequence is not a DNA nor a RNA chain.'});
            return false;
        }
        else if (checkSequence(seq) == 'RNA') {
            addText({'compl_error': 'Your sequence is a RNA chain. RNA chains are single-stranded. You need a DNA-type sequence for this function to work'});
            return false;
        }
        for (var i=0; i<N; i++) {
            var b = seq.charAt(i).toUpperCase(); // b = base
            compl_seq += comp_base(b);
        }
        addText({'compl_result': compl_seq});
        return true;
    }

    document.getElementById('translate_button').onclick = function () {
        document.getElementById('translate_button').disabled = true;
        var seq = document.getElementById('sequence').value;
        if (! checkSequence(seq)) {
            addText({'aa_error': 'The sequence you pasted is invalid'});
            return false;
        }
        var seq_lower = seq.toLowerCase();
        var N= seq_lower.length;
        var proteins = [];
        var abb_one = false; //sets by default the three-letter abbreviation
        var abb = document.getElementById('abb_choices').value; // abb checks whether the user prefers one-letter or three-letter abbreviations for amino acids
        if (abb === 'one_abb') {
            abb_one = true;
        }
        for (var i=0; i<3; i++) {
            var protein = translateToProtein(i, seq_lower, abb_one);
            proteins.push(protein);
        }
        addText({
            'amino': proteins[0],
            'amino1': proteins[1],
            'amino2': proteins[2],
        });
    }
    document.getElementById('abb_choices').onchange = function () {
        clearFields(elements = 'aa_clear', buttons = "aa_btn_clear");
    }

    document.getElementById('clear_aa').onclick = function() {
        clearFields(elements = 'aa_clear', buttons = "aa_btn_clear");
    }

    document.getElementById('orf_check').onclick = function() {
        document.getElementById('orf_check').disabled = true;
        var sequence = document.getElementById('sequence').value.toLowerCase();
        var validSeq = checkSequence(sequence);
        if (! validSeq) {
            addText({'error_orf': 'Sorry, invalid sequence'});
            return;
        }
        sequence = translateToDNA(sequence);
        var min_orf = document.getElementById('orf_min_length').value;
        var valid_orf = min_orf.match(/[0-9]+/);
        if ( (!valid_orf) || (valid_orf.length > min_orf.length)) {
            addText({'error_orf':'Working on it'});
            return;
        }
        var min_length = parseInt(valid_orf);
        if (min_length < 0 || min_length > sequence.length) {
            addText({
                'error_orf': 'ERROR! Provide a number equal or bigger than 0; and equal or smaller than your sequence',
            })
            return;
        }
        var orfs ={};
        for (var i= 0; i<3; i++) { // get the results for the three frames
            var proteins = [];
            for (var index=i; index < sequence.length; index+=3) {
                var codon = sequence.substring(index, index + 3);
                //check if there is a stop codon in the substring, and afterwards, if its length is bigger than the minimum length provided by the user
                if (codon === 'atg') {
                    var open_frame = sequence.substring(index, sequence.length); 
                    var is_orf = hasStop(open_frame);
                    if (is_orf) {
                        var protein_size = (is_orf.length - 3)/3;
                        if (protein_size >= min_length) {
                            proteins.push(is_orf.toUpperCase());
                        }
                    }
                }
                orfs[i] = [proteins];   
            }
        }
        if (orfs.length === 0) {
            addText({'error_orf': 'I have not found any valid ORFs in your sequence'});
            return;
        }
        for (var key in orfs) {
            if (orfs.hasOwnProperty(key)) {
                var sequences = orfs[key];
                var intKey = parseInt(key);
                for (var i=0; i< sequences.length; i++) {
                    if (intKey === 0) {
                        addText({
                            'orf_n0': sequences[i].length,
                            'orfs0': sequences[i],
                        });
                    }
                    else if (intKey === 1) {
                        addText({
                            'orf_n1': sequences[i].length,
                            'orfs1': sequences[i],
                        });
                    }
                    else if (intKey === 2) {
                        addText({
                            'orf_n2': sequences[i].length,
                            'orfs2': sequences[i],
                        });
                    }  
                }
            } 
        }
    }
    document.getElementById('orf_min_length').onchange = function () {
        clearFields(elements = 'orf_clear', buttons = 'orf_btn_clear');
    }    
}