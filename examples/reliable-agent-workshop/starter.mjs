// No provider calls, credentials or dependencies. Node.js 24.
export const records=new Map([
 ['HV-2048',{id:'HV-2048',status:'Customs hold',eta:'Estimated 2026-11-09 08:30 CET'}],
 ['HV-2049',{id:'HV-2049',status:'Ready for pickup',eta:'Recorded 2026-11-08 06:00 CET'}]
]);
export function lookupShipment(reference){
 if(typeof reference!=='string'||!/^HV-\d{4}$/.test(reference))throw new Error('Invalid reference');
 const shipment=records.get(reference);
 return shipment?{found:true,shipment}:{found:false,message:'Verify the exact reference.'};
}
export function proposeReview(reference,reason){
 const found=lookupShipment(reference);
 if(!found.found)throw new Error('Cannot propose review for an unknown shipment');
 if(typeof reason!=='string'||reason.trim().length<8)throw new Error('Concrete reason required');
 return {shipmentId:reference,status:'Pending review',reason:reason.trim(),synthetic:true};
}
export function answer(reference,language='en'){
 const r=lookupShipment(reference);
 const messages={en:r.found?'Recorded status only. Human approval remains required.':'Reference not found. Verify it before proceeding.',nl:r.found?'Alleen de geregistreerde status. Menselijke goedkeuring blijft nodig.':'Referentie niet gevonden. Controleer deze eerst.',fr:r.found?'Statut enregistré uniquement. Une validation humaine reste nécessaire.':'Référence introuvable. Vérifiez-la avant de continuer.'};
 if(!Object.hasOwn(messages,language))throw new Error('Unsupported language');
 return {...r,language,explanation:messages[language],mode:'DETERMINISTIC DEMO'};
}
