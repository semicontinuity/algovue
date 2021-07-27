package leetcode.medium.p1429_minimum_remove_to_make_valid_parentheses;

import javax.annotation.processing.Generated;

import algovue.annotations.Block;
import algovue.annotations.Indexes;

public class Solution {

    private String minRemoveToMakeValid(String s) {
        StringBuilder ans = new StringBuilder();

        int _0;

        // 1. count number of closing parentheses
        int close = 0;
        @Generated("s")
        int i = 0;
        while (i < s.length()) {
            if (s.charAt(i) == ')') {
                close++;
            }
            i++;
        }

        int _1;

        int open = 0;
        i = 0;

        int _2;

        while (i < s.length()) {
            char c = s.charAt(i);
            i++;
            int _3_0;

            if (c == '(') {

                @Generated(value = {}, comments = "check whether we have enough closing parentheses left; if not, we should remove this one.") int _3_a1;
                if (open >= close) {
                    @Generated(value = {"#FFFFF0", "FFD0D0"}) int $a;
                    @Generated(value = {}, comments = "not enough closing parentheses") int _3_b2;
                    continue;
                }
                open++;
            } else if (c == ')') {
                close--;    // adjust number of remaining ')'

                int _3_b;
                @Generated(value = {}, comments = "check whether we have enough open parentheses") int _3_b1;
                if (open == 0) {
                    @Generated(value = {"#FFFFF0", "FFD0D0"}) int $a;
                    @Generated(value = {}, comments = "not enough open parentheses") int _3_b2;
                    continue;   // not enough open parentheses
                }
                open--;
            }

            int _3_e;
            ans.append(c);
        }

        int _4;

        return ans.toString();
    }

    String result1 = minRemoveToMakeValid("(a(b(c)d)");
}
