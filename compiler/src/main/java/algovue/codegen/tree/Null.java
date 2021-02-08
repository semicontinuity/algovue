package algovue.codegen.tree;

public class Null extends Expression {

    @Override
    public CharSequence charSequence(int indent) {
        return "vm.nullLiteral()";
    }
}
