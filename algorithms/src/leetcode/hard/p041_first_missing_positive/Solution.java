package leetcode.hard.p041_first_missing_positive;

import javax.annotation.Generated;

public class Solution {

    @Generated("First Missing Positive (https://leetcode.com/problems/first-missing-positive/)")
    int firstMissingPositive(int[] a, int n) {
        @Generated("a")
        int i = 0;
        while (i < n) {
            @Generated(comments = "Push a[i] value to its place until it contains proper value", value = {"#F4F0FF", "E0D0FF"}) int $a;
            while (a[i] != i + 1) {
                if (a[i] <= 0 || a[i] > n) {
                    @Generated(value = {}, comments = "Value is out range") int _;
                    break;
                }
                if (a[i] == a[a[i] - 1]) {
                    @Generated(value = {}, comments = "Would not exchange for the same value") int _;
                    break;
                }

                int _1;

                @Generated(comments = "Exchange a[i] and a[a[i] - 1]", value = {"FFFAFA", "FFF0F0"}) int $b;
                int temp = a[i];
                //@Generated("a")   // somehow, view is not updated, if annotated as pointer
                int tempPtr = temp - 1;

                a[i] = a[tempPtr];
                a[tempPtr] = temp;
            }
            i++;
        }

        int _1;
        @Generated(comments = "Scan to find non-proper value", value = {"#F0F8FF", "A0D0FF"}) int $b;
        i = 0;
        while (i < n) {
            if (a[i] != i + 1) {
                return i + 1;
            }
            i++;
        }

        int _exit;
        @Generated(comments = "All first n values present, return n + 1", value = {}) int _;
        return n + 1;
    }

    int result = firstMissingPositive(new int[]{3, 4, -1, 1}, 4);
}
