package algo.strings;

import algovue.annotations.Block;
import algovue.annotations.EolComment;
import algovue.annotations.Indexes;
import algovue.annotations.MethodComment;
import algovue.annotations.StandAloneComment;

public class KnuthMorrisPratt {

    @MethodComment("Preprocess the pattern (calculate lps[] array)")
    int[] computeLPSArray(String pat) {
        @StandAloneComment("Note, this is exacly like KMP, only it compares pattern with itself and fills lps as it runs") int _c1;

        int M = pat.length();
        int[] lps = new int[M];
        lps[0] = 0; // lps[0] is always 0

        int _0;

        // length of the previous longest prefix suffix
        @Indexes({"pat", "lps"})
        int j = 0;
        @Indexes({"pat", "lps"}) int i = 1;

        int _1;

        // the loop calculates lps[i] for i = 1 to M-1
        while (i < M) {
            if (pat.charAt(i) == pat.charAt(j)) {
                @Block(text = "Match at position i", colors = {"#F0FFF0", "D0FFD0"}) int $a;
                lps[i] = j + 1;
                j++;
                i++;
            } else {
                @Block(text = "Mismatch at position i", colors = {"FFFAFA", "FFF0F0"}) int $b;
                // (pat[i] != pat[len])

                // This is tricky. Consider the example.
                // AAACAAAA and i = 7. The idea is similar
                // to search step.
                if (j == 0) {
                    @Block(colors = {"#F4F0FF", "E0D0FF"}) int $b0;
                    lps[i] = j;
                    i++;
                } else {
                    @Block(colors = {"#F0F8FF", "A0D0FF"}) int $b1;
                    @EolComment("Note, that i is NOT incremented") int _b1;
                    j = lps[j - 1];
                }
            }
        }

        int _2;
        return lps;
    }


    @MethodComment("Knuth-Morris-Pratt algorithm")
    private int kmp(String txt, String pat) {

        int N = txt.length();
        int M = pat.length();
        if (M <= 0) return -1;
        int _emptyLine0;

        int[] lps = computeLPSArray(pat);
        @Indexes({"pat", "lps"}) int j = 0;
        @Indexes("txt") int i = 0;

        int _emptyLine1;
        while (i < N) {
            if (txt.charAt(i) == pat.charAt(j)) {
                @Block(text = "Match at position i", colors = {"#F0FFF0", "D0FFD0"}) int $a;
                j++;
                i++;
                if (j == M) {
                    return i - j;
                }
            } else {
                @Block(text = "Mismatch at position i", colors = {"FFFAFA", "FFF0F0"}) int $b;
                if (j == 0) {
                    @Block(colors = {"#F4F0FF", "E0D0FF"}) int $b0;
                    i++;  // Mismatch right at the first character: restart matching from the next one
                } else {
                    @Block(colors = {"#F0F8FF", "A0D0FF"}) int $b1;
                    @EolComment("We know that j characters match. Note, that i is NOT incremented.") int _c2;
                    j = lps[j - 1];
                }
            }
        }

        int _emptyLine2;
        return -1;
    }

    int index = kmp("ABABDABACDABABCABAB", "ABABCABAB");
}
