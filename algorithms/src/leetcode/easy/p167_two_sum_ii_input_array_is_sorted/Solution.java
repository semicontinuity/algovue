package leetcode.easy.p167_two_sum_ii_input_array_is_sorted;

import algovue.annotations.Indexes;
import algovue.annotations.MethodComment;
import algovue.annotations.RangeAggregate;

public class Solution {

    @MethodComment("https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/")
    public int[] twoSum(int[] numbers, int target) {
        if (numbers == null || numbers.length == 0)
            return null;

        int __1;    // -----------------------------------------------------------------------------------------

        @Indexes({"numbers"})
        int i = 0;
        @Indexes({"numbers"})
        int j = numbers.length - 1;

        int __2;    // -----------------------------------------------------------------------------------------

        while (i < j) {
            @RangeAggregate(array = "numbers", indices = {"i", "j"})
            int x = numbers[i] + numbers[j];
            if (x < target) {
                i = i + 1;
            } else if (x > target) {
                j = j - 1;
            } else {
                return new int[] { i + 1, j + 1 };
            }
        }

        int __3;    // -----------------------------------------------------------------------------------------

        return null;
    }

    int[] result = twoSum(new int[] {-25, -20, -12, -4}, -32);
}
