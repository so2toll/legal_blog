import type { Handler } from '@netlify/functions'
import type { APIRoute } from 'astro';
import fetch from "node-fetch";
import neo4j from 'neo4j-driver';
export const get: APIRoute = async ({params, request}) => {
  

  const driver = neo4j.driver(process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD), 
    {/* encrypted: 'ENCRYPTION_OFF' */});

    const query =
    `
    
    MATCH (n:testUrl15) where n.slug = 'visitation' and size(n.name) <25 RETURN n limit 15000
  
    
    `;
  
  const session = driver.session({database:"neo4j"});
  
  const response = await session.run(query)
    .then((result: { records: any[]; }) => {
      const allRecords: any[] = [];
      result.records.forEach((record) => {
  
        let facility= record.get('n').properties.name.toLowerCase().replace(/\s/g , "-").replace("/" , " "); 
        let path= record.get('n').properties.name.toLowerCase().replace(/\s/g , "-");
        let stateName= record.get('n').properties.state.toLowerCase().replace(/\s/g , "-");
        let slug = record.get('n').properties.slug
        let slugPath = record.get('n').properties.slug
        // let metaDescription = record.get('n').properties.metaDescription;
        // let metaTitle = record.get('n').properties.metaTitle;
        // slugPath='send'
        // slug='write-a-prisoner'
        slug == undefined || slug == '' ? slug='' : slug
        // slug='send'
          allRecords.push(
            {
              state: record.get('n').properties.state,
              facility,
              title: record.get('n').properties.name.replace("/" , " "),
              // title: record.get('n').properties.title
              // updatedOn: record.get('n').properties.updatedOn,
              updatedOn: '12-16-2022',
              stateName,
              path,
              slug,
              slugPath,
              facilityName: record.get('n').properties.name.replace("/" , " "), 
              city: record.get('n').properties.city,
              county: record.get('n').properties.county,
              locator: "Use Our Free Inmate Locator",
              address: record.get('n').properties.address,
              phone: record.get('n').properties.phone, 
        
              // state: 'alabama', 
              // facility:'dekalb-county-jail', 
              // title:"Dekalb County Jails", 
              // updatedOn: '2022-10-01',
              // stateName:'alabama',
              // path:'dekalb-county-jail',
              // facilityName:'Dekalb County Jail',
              // episode_id:"3",
              // city: "Draper",
              // county: "Dekalb County",
              // state: "Alabama",
              // facility: "Dekalb County Jail",
              // locator: "Use Our Free Inmate Locator",
              // address: "14425 Bitterbrush Lane, Draper, AL, 84020",
              // phone: "777-777-7000",
              // slug:''
          });
          
      });
      session.close();
      driver.close();
      return allRecords;
    })
    .catch((error: any) => {
      console.error(error);
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        "message": response,
      }),
    }
  }
  