package leetcode.hard.p862_shortest_subarray_with_sum_at_least_k;

import java.util.Deque;
import java.util.LinkedList;

public class Solution {

    public int shortestSubarray(int[] A, int K) {
        int N = A.length;
        long[] P = new long[N+1];

        int i = 0;
        while (i < N) {
            P[i+1] = P[i] + A[i];
            i++;
        }

        // Want smallest y-x with P[y] - P[x] >= K
        int ans = N+1; // N+1 is impossible
        Deque<Integer> monoq = new LinkedList<>(); //opt(y) candidates, as indices of P

        int y = 0;
        while (y < P.length) {
            // Want opt(y) = largest x with P[x] <= P[y] - K;
            while (!monoq.isEmpty() && P[y] <= P[monoq.getLast()]) {
                monoq.removeLast();
            }
            while (!monoq.isEmpty() && P[y] >= P[monoq.getFirst()] + K) {
                ans = Math.min(ans, y - monoq.removeFirst());
            }

            monoq.addLast(y);
            y++;
        }

        if (ans < N + 1) {
            return ans;
        }
        return -1;
    }

    int result = shortestSubarray(new int[] {2, -1, 2}, 3);
}
