

export async function EventRegisterFormSubmitMetadataAddons(eventType, eventData, ) {
  //add meta data to registration form submit associated with reqistered patient
  console.log("adding meta data to registration form submit associated with reqistered patient")

    //event payload
let eventPayload = {
    "eventType": eventType,
    // "eventCreatedAt": new Date().toISOString(),
    "eventData": {
      "xanoId": eventData.xanoId,
      "patientId": eventData.patientId,
      "email": eventData.email,
      "password": eventData.password,
      "name":eventData.name,
      "role":eventData.role
   
    }
  }

    return eventPayload
}

export async function RegisterXanoUser(email, password, name) {

        //add patient roles / extras here to include user Role

    
        const auth = ` https://x8ki-letl-twmt.n7.xano.io/api:0PA0Fq7n:v1/auth/signup?name=${name}&email=${email}&password=${password}`;
        const checkAuth = await fetch(auth, {method:'POST',})
        .then(res => res.json());

        console.log("checkAuth", checkAuth);

        if(checkAuth.message){
            console.log("Something is wrong with this register information. Send error message to client.");
            return {
                statusCode: 404,
                body: JSON.stringify({
                    "message": checkAuth.message
                }),
            }
        }else{
            console.log("made it here. check auth registration is good. time to send login email");

            //https://x8ki-letl-twmt.n7.xano.io/api:0PA0Fq7n https://xldy-0jot-laoc.n7.xano.io/api:MeY9vZKV
            // const auth = ` https://x8ki-letl-twmt.n7.xano.io/api:0PA0Fq7n:v1/auth/magic-link?email=${email}`;
            // const checkAuth = await fetch(auth, {method:'POST',})
            // .then(res => res.json());
        
            // console.log("checkAuth", checkAuth); const email = body.email;
            console.log("magicToken adfd", email);
        
            // Check auth with Xano
            const auth = ` https://x8ki-letl-twmt.n7.xano.io/api:0PA0Fq7n:v1/auth/magic-link?email=${email}`;
            const checkAuth = await fetch(auth)
            .then(res => res.json());
        
            // console.log("checkAuth", checkAuth);
        
            if(checkAuth.message.success){
                console.log("Magic link sent successfully.");
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        "message": "success"
                    }),
                }
            }else{console.log("Something is wrong with sending this magic link.");
                return {
                statusCode: 404,
                body: JSON.stringify({
                    "message": "failed"
                }),
            } 
            }
        

        
    

        console.log(774345345, " the current event object is: " , eventObject);

        return eventObject
    } 
}

export async function PatientRegisteredRelationships(payload) {
    console.log("trying the create patient relationships. here payload in relaitionship assignment" , payload);
    //   let eventPayload = {
//     "eventType": eventType,
//     "eventData": {
//       "xanoId": xanoId,
//       "patientId": genereatedPatientId,
//     }
//   }
    return {payload}
  // try {
  //   const { providerId, name, email } = req.body;

  //   // First, create a new patient in Xano
  //   const newPatient = await xanoClient.post('patients', { name, email });

  //   // Then, create a new relationship in Neo4j between the patient and the provider
  //   const result = await session.run(
  //     'MATCH (p:Patient { id: $patientId }), (pr:Provider { id: $providerId }) CREATE (p)-[:TREATED_BY]->(pr) RETURN p, pr',
  //     { patientId: newPatient.id, providerId }
  //   );

  //   res.json({ message: 'Patient created successfully!' });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ error: 'An error occurred while creating the patient.' });
  // } finally {
  //   session.close();
  // }
}

export async function SendEventToWriteAPI(eventObject) {
console.log(9242424999,eventObject)
  // eventRelationships, eventObject
  if (eventObject.eventObject.eventType =="PatientRegistered"){
//     let {eventRelationships, eventObject} = await buildEventPayload(eventType, xanoId, genereatedPatientId); 

//  let response = await SendEventToWriteAPI(eventRelationships, eventObject); 
console.log("Time to send a write to the write api for this Patient Regsitered Event Object", eventObject);
return eventObject.eventObject
}

  console.log("trying to send data to alternative write apis");
// try {
//   const { providerId, name, email } = req.body;

//   // First, create a new patient in Xano
//   const newPatient = await xanoClient.post('patients', { name, email });

//   // Then, create a new relationship in Neo4j between the patient and the provider
//   const result = await session.run(
//     'MATCH (p:Patient { id: $patientId }), (pr:Provider { id: $providerId }) CREATE (p)-[:TREATED_BY]->(pr) RETURN p, pr',
//     { patientId: newPatient.id, providerId }
//   );

//   res.json({ message: 'Patient created successfully!' });
// } catch (err) {
//   console.error(err);
//   res.status(500).json({ error: 'An error occurred while creating the patient.' });
// } finally {
//   session.close();
// }
}
