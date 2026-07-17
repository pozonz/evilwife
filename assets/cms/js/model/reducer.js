export default function reducer(state = {}, action) {
    switch (action.type) {
        case 'change':
            let newState = {
                ...state,
                ...action.payload,
            };

            $('#model_columnsJson').val(JSON.stringify(newState.columns));
            return newState;

        default:
            return state;
    }
}