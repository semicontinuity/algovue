package algo.strings;

import javax.annotation.processing.Generated;

public class ReverseArray {

    private int[] reverse(int[] a, int length) {
        @Generated("a")
        int head = 0;
        @Generated("a")
        int tail = length - 1;

        while (head < tail) {
            int x = a[head];
            int y = a[tail];
            a[head] = y;
            a[tail] = x;
            head = head + 1;
            tail = tail - 1;
        }
        return a;
    }

    int[] result = reverse(new int[] {'h', 'e', 'l', 'l', 'o'}, 5);
}
