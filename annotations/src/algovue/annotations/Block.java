package algovue.annotations;

import java.lang.annotation.*;
import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.*;

/**
 * Beginning of the block of code.
 * Dummy variable, annotated with this annotation, must start with '$'.
 * Block terminates, when the scope, in which it was started, finishes.
 * Or, it is possible to explicitly terminate block by delaring another dummy variable with name,
 * starting in '$', but without annotations.
 * <p/>
 * Example:
 *
 * <blockquote><pre>
 *     {@literal @}Block(text = "Match at position i", colors = {"#F0FFF0", "D0FFD0"}) int $a;
 *      i++;
 *      j++;
 *      int $a$;
 * </pre></blockquote>
 */
@Documented
@Retention(SOURCE)
@Target({PACKAGE, TYPE, ANNOTATION_TYPE, METHOD, CONSTRUCTOR, FIELD,
        LOCAL_VARIABLE, PARAMETER})
public @interface Block {
   /** inactive and active background color */
   String[] colors();
   /** header text */
   String text() default "";
}
