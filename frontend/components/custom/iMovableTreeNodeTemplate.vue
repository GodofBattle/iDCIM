<script>
export default {
    functional: true,
    props: {
        node: {
            type: null,
            default: null
        },
        template: {
            type: null,
            default: null
        }
    },
    render(createElement, context) {
        const content = context.props.template
            ? context.props.template({
                  node: context.props.node
              })
            : context.props.node.label;

        return [content];
    }
};
</script>
