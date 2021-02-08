package leetcode.hard.p042_trapping_rain_water;

import javax.annotation.processing.Generated;

public class Solution {

    @Generated("Trapping Rain Water (https://leetcode.com/problems/trapping-rain-water/)")
    public int trap(int[] height, int n) {
        if (n == 0) return 0;

        int _1;

        @Generated("height")
        int left = 0;
        @Generated("height")
        int right = n - 1;

        int _2;

        int leftMax = height[left];
        int rightMax = height[right];
        int result = 0;

        int _3;

        while (left < right) {
            if (leftMax < rightMax) {
                left++;
                leftMax = Math.max(leftMax, height[left]);
                // result += leftMax - height[left]
                // (codegen bug)
                result = result + leftMax - height[left];
            } else {
                right--;
                rightMax = Math.max(rightMax, height[right]);
                result = result + rightMax - height[right];
            }
        }
        return result;
    }



    int result = trap(new int[] {0,1,0, 2,1,0, 1,3,2, 1,2,1}, 12);
}
