"use client";
import { useFilteredListRequest } from "@/lib/hooks/useFilteredListRequest";
import { ViewCardProps } from '@/types';
import { formatLabel } from '@/lib/utils/cardViewHelper';
import { generateSearchFieldsFromEndpoint } from "@/lib/utils/generateSearchFields";
import {SearchFilterForm} from "@/components/Search/SearchFilterForm";

export default function ViewCard(props: ViewCardProps) {

  const {alias,viewFields,title = "Items",createButton,updateButton,viewButton} = props;
  const data = useFilteredListRequest(alias);
    const SearchFields = generateSearchFieldsFromEndpoint(alias);
    console.log(SearchFields);

 
  


  return (

      <>  
        <SearchFilterForm fields={SearchFields} />

        <div className="head">
          <h2 className="title-1">{title}</h2>
          {createButton}
        </div>
        <div className="card-continear">
          {data.data?.map((item: any) => (
            <div key={item.id} className="card">
              {viewFields?.map((field) => (
                <p key={field} className="card-body">
                  <strong>{formatLabel(field)}:</strong> {item[field]}
                </p>
              ))}
              <div className="btn-card">                
                {updateButton && updateButton(item.id)}
                {viewButton && viewButton(item.id)}
              </div>
            </div>
          ))}
        </div>
      </>
  );
}



   // const { setAsideContent } = useAside();
    // useEffect(() => {
    //   setAsideContent(
    //     <SearchFilterForm fields={SearchFields} />
    //   );
  
    //   return () => {
    //     setAsideContent(null);
    //   };
    // }, [setAsideContent]);