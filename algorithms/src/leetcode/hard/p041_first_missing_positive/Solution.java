package leetcode.hard.p041_first_missing_positive;

import javax.annotation.processing.Generated;

public class Solution {

    @Generated("First Missing Positive (https://leetcode.com/problems/first-missing-positive/)")
    int firstMissingPositive(int[] a, int n) {

        @Generated("a")
        int i = 0;

        while (i < n) {
            @Generated("Push a[i] value to its place until it contains proper value") int _bc1;
            while (true) {
                @Generated({"FFF0F0", "FFD0D0"}) int $a;
                int a_i = a[i];
                if (a_i <= 0 || a_i > n) {
                    @Generated(value = {}, comments = "Value is out range, nowhere to push it") int _0;
                    break;
                }
                int $a$;

                int __1;    // -----------------------------------------------------------------------------------------

                @Generated({"#F0FFF0", "D0FFD0"}) int $b;
                @Generated(value = {}, comments = "Proper place for value in a[i]") int _b1;
                @Generated("a")   // somehow, view is not updated, if annotated as pointer
                int j = a_i - 1;
                if (i == j) {
                    @Generated(value = {}, comments = "Value is on its place") int _b2;
                    break;
                }
                int $b$;

                int __2;    // -----------------------------------------------------------------------------------------

                @Generated({"#FFFFF0", "FFFFD0"}) int $c;
                int a_j = a[j];
                if (a_i == a_j) {
                    @Generated(value = {}, comments = "Would not exchange for the same value") int _c1;
                    break;
                }
                int $c$;

                int __3;    // -----------------------------------------------------------------------------------------

                @Generated(comments = "Exchange a[i] and a[j]", value = {"#F0F8FF", "C0E0FF"}) int $d;
                a[i] = a_j;
                a[j] = a_i;
                int $d$;

                int __4;    // -----------------------------------------------------------------------------------------
                @Generated(value = {}, comments = "Dummy, to visualize") int _e1;
                continue;
            }
            i++;
        }

        int __3;

        @Generated(comments = "Scan to find out-of-place value", value = {"#F4F0FF", "E0D0FF"}) int $s;
        @Generated("a")
        int k = 0;
        while (k < n) {
            if (a[k] != k + 1) {
                return k + 1;
            }
            k++;
        }

        int __4;

        @Generated(comments = "All first n values present, return n + 1", value = {}) int _bc2;
        return n + 1;
    }

    int result = firstMissingPositive(new int[]{3, 3, 4, -1, 1}, 5);
}
