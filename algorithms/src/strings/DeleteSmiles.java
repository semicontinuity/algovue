package strings;

import javax.annotation.Generated;


public class DeleteSmiles {

    @Generated(value = {}, comments = "Deletes smiles like :-))) or :-(( in a string")
    private StringBuilder deleteSmiles(String a, int length) {
        StringBuilder result = new StringBuilder();

        @Generated("a")
        int i = 0;

        while (i < length) {
            @Generated(comments = "Consume char 1 of pattern", value = {"#FFFFF0", "FFFFD0"}) int $1;
            char c1 = a.charAt(i++);
            if (i >= length || c1 != ':') {
                @Generated(value = {"#FFFFF0", "FFD0D0"}) int $m;
                result.append(c1);
                continue;
            }
            int $1$;
            int _1;

            @Generated(comments = "Consume char 2 of pattern", value = {"#F0FFF0", "D0FFD0"}) int $2;
            char c2 = a.charAt(i++);
            if (i >= length || c2 != '-') {
                @Generated(value = {"#F0FFF0", "FFD0D0"}) int $m;
                result.append(c1);
                result.append(c2);
                continue;
            }
            int $2$;
            int _2;

            @Generated(comments = "Consume char 3 of pattern", value = {"#F0F0FF", "D0D0FF"}) int $3;
            char c3 = a.charAt(i++);
            if (c3 != ')' && c3 != '(') {
                @Generated(value = {"#F0F0FF", "FFD0D0"}) int $m;
                result.append(c1);
                result.append(c2);
                result.append(c3);
                continue;
            }
            int $3$;
            int _3;

            @Generated(comments = "Consume repetitions of char 3", value = {"#F4F0FF", "E0D0FF"}) int $4;
            while (true) {
                if (i >= length) {
                    return result;
                }

                char c = a.charAt(i);
                if (c != c3) {
                    @Generated(value = {"#F4F0FF", "FFD0D0"}) int $m;
                    break;
                }
                i = i + 1;    // <----------------------- advance only if match; otherwise will re-parse from c4 position
            }
        }
        return result;
    }

    StringBuilder result = deleteSmiles("Hi:-)) :-)_:-(( :)", 18);
}
