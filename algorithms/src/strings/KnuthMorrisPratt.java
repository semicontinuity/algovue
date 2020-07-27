package strings;

import javax.annotation.Generated;

public class KnuthMorrisPratt {

    @Generated("Preprocess the pattern (calculate lps[] array)")
    void computeLPSArray(String pat, int M, int[] lps) {
        lps[0] = 0; // lps[0] is always 0

        // length of the previous longest prefix suffix
        @Generated(value = {"pat", "lps"})
        int j = 0;
        @Generated(value = {"pat", "lps"}) int i = 1;
        int _0;

        // the loop calculates lps[i] for i = 1 to M-1
        while (i < M) {
            if (pat.charAt(i) == pat.charAt(j)) {
                @Generated(comments = "Match at position i", value = {"#F0FFF0", "D0FFD0"}) int $a;
                lps[i] = j + 1;
                j++;
                i++;
            } else {
                @Generated(comments = "Mismatch at position i", value = {"FFFAFA", "FFF0F0"}) int $b;
                // (pat[i] != pat[len])

                // This is tricky. Consider the example.
                // AAACAAAA and i = 7. The idea is similar
                // to search step.
                if (j == 0) {
                    @Generated(value = {"#F4F0FF", "E0D0FF"}) int $b0;
                    lps[i] = j;
                    i++;
                } else {
                    @Generated(value = {"#F0F8FF", "A0D0FF"}) int $b1;
                    @Generated(value = {}, comments = "Note, that i is NOT incremented") int _;
                    j = lps[j - 1];
                }
            }
        }
        @Generated("Note, this is exacly like KMP, only it compares pattern with itself and fills lps as it runs") int _;
    }

    @Generated("Knuth-Morris-Pratt algorithm")
    private int kmp(String txt, int N, String pat, int M, int[] lps) {
        if (M <= 0) return -1;
        computeLPSArray(pat, M, lps);
        @Generated({"pat", "lps"}) int j = 0;
        @Generated("txt") int i = 0;

        int _1;
        while (i < N) {
            if (txt.charAt(i) == pat.charAt(j)) {
                @Generated(comments = "Match at position i", value = {"#F0FFF0", "D0FFD0"}) int $a;
                j++;
                i++;
                if (j == M) {
                    return i - j;
                }
            } else {
                @Generated(comments = "Mismatch at position i", value = {"FFFAFA", "FFF0F0"}) int $b;
                if (j == 0) {
                    @Generated(value = {"#F4F0FF", "E0D0FF"}) int $b0;
                    i++;  // Mismatch right at the first character: restart matching from the next one
                } else {
                    @Generated(value = {"#F0F8FF", "A0D0FF"}) int $b1;
                    @Generated(value = {}, comments = "We know that j charaters match. Note, that i is NOT incremented.") int _;
                    j = lps[j - 1];
                }
            }
        }

        int _exit;
        return -1;
    }

    int index = kmp("ABABDABACDABABCABAB", 19, "ABABCABAB", 9, new int[9]);
}
