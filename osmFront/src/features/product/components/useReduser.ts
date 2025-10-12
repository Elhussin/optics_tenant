      // ----------------- useReducer Setup -----------------
      type State = {
        showModal: boolean;
        entity: string;
        attributes: any[];
        currentFieldName: string;
        variantCount: number;
        isProduct: boolean;
        isVariant: boolean;
        openVariantIndex: number | null;
      };
      
      type Action =
        | { type: 'TOGGLE_MODAL' }
        | { type: 'SET_ENTITY'; payload: string }
        | { type: 'ADD_ATTRIBUTE'; payload: any }
        | { type: 'SET_CURRENT_FIELD'; payload: string }
        | { type: 'SET_VARIANT_COUNT'; payload: number }
        | { type: 'TOGGLE_IS_PRODUCT' }
        | { type: 'TOGGLE_IS_VARIANT' }
        | { type: 'SET_OPEN_VARIANT_INDEX'; payload: number | null };
      
      const initialState: State = {
        showModal: false,
        entity: '',
        attributes: [],
        currentFieldName: '',
        variantCount: 1,
        isProduct: true,
        isVariant: false,
        openVariantIndex: null,
      };
      
      function reducer(state: State, action: Action): State {
        switch (action.type) {
          case 'TOGGLE_MODAL':
            return { ...state, showModal: !state.showModal };
          case 'SET_ENTITY':
            return { ...state, entity: action.payload };
          case 'ADD_ATTRIBUTE':
            return { ...state, attributes: [action.payload, ...state.attributes] };
          case 'SET_CURRENT_FIELD':
            return { ...state, currentFieldName: action.payload };
          case 'SET_VARIANT_COUNT':
            return { ...state, variantCount: action.payload };
          case 'TOGGLE_IS_PRODUCT':
            return { ...state, isProduct: !state.isProduct };
          case 'TOGGLE_IS_VARIANT':
            return { ...state, isVariant: !state.isVariant };
          case 'SET_OPEN_VARIANT_INDEX':
            return { ...state, openVariantIndex: action.payload };
          default:
            return state;
        }
      }
      