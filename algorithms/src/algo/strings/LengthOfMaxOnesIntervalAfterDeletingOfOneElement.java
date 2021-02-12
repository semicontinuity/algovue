package algo.strings;


import javax.annotation.processing.Generated;

import algovue.annotations.Indexes;
import algovue.annotations.RangeAggregate;

public class LengthOfMaxOnesIntervalAfterDeletingOfOneElement {

    @Generated("given array of 0s and 1s, find maximal sub-interval of 1s after some element is deleted")
    private int length_of_max_ones_interval_after_deleting_of_one_element(int[] a, int length) {
        @RangeAggregate("i")
        int curSize = 0;
        int prevSize = 0;
        int maxSize = 0;
        boolean zeroesOccurred = false;

        int _1;

        @Indexes("a")
        int i = 0;

        while (i < length) {
            int value = a[i];
            int _2_1;

            if (value == 1) {
                @Generated(comments = "one", value = {"#F0FFF0", "D0FFD0"}) int $;
                @Generated("current block of 1s grows") int _2_2_1;
                curSize = curSize + 1;
                if (curSize + prevSize > maxSize) {
                    maxSize = curSize + prevSize;
                }
            } else {
                @Generated(comments = "zero", value = {"FFF0F0", "FFD0D0"}) int $;
                zeroesOccurred = true;
                // "shift": <-- prevSize <-- size <-- 0;
                // after first zero: prevSize == (size of first block of 1s); size = 0
                // after second zero: prevSize == 0; size == 0 for complete "reset"
                @Generated("current block becomes previous") int _x;
                prevSize = curSize;
                @Generated("New empty block starts") int _2_2_2;
                curSize = 0;
            }

            int _2_3;
            i = i + 1;
        }

        int _3;

        @Generated(value = "Consider special case of all-ones") int _4;
        if (zeroesOccurred) {
            return maxSize;
        } else {
            return maxSize - 1;
        }
    }

    int result = length_of_max_ones_interval_after_deleting_of_one_element(new int[] {0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0}, 15);
}
