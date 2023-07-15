/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'; 
import { db } from './firebase';
import { getDownloadURL } from './storage';

const ACTIVITIES_COLLECTION = 'activities';

export function addReceipt(uid, date, locationName, work, equipment, issues, imageBucket) {
    addDoc(collection(db, ACTIVITIES_COLLECTION), { uid, date, locationName, work, equipment, issues, imageBucket })
    .then(() => {
        console.log("receipt added successfully ");
    }).catch((error) => {
        console.log("error adding receipt " + error);
    });
}

export async function getReceipts(uid, setReceipts, setIsLoadingReceipts) {
    const receiptsQuery = query(collection(db, ACTIVITIES_COLLECTION), where("uid", "==", uid), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(receiptsQuery, async(snapshot) => {
        let allReceipts = [];
        for(let documentSnapshot of snapshot.docs){
            const receipt = documentSnapshot.data();
            await allReceipts.push({
                ...receipt,
                date: receipt['date'].toDate(),
                id: documentSnapshot.id,
                imageUrl: await getDownloadURL(receipt['imageBucket'])
            });
            // console.log("this is the amount: " + receipt['amount']);
        }
        setReceipts(allReceipts);
        setIsLoadingReceipts(false);
    });
    return unsubscribe;
}

export function updateReceipt(docId, uid, date, locationName, work, equipment, issues, imageBucket){
    setDoc(doc(db, ACTIVITIES_COLLECTION, docId), { uid, date, locationName, work, equipment, issues, imageBucket })
    // .then(() => {
    //     console.log("receipt updated successfully with uid " + uid);
    //     console.log("receipt's document id is: " + docId);
    // }).catch((error) => {
    //     console.log("Error updating  receipt: " + error);
    // })
}

export function deleteReceipt(docId){
    deleteDoc(doc(db, ACTIVITIES_COLLECTION, docId)).then(function() {
        console.log("receipt deleted from firestore with id: " + docId);
    }).catch((error) => {
        console.log("Error deleting  receipt: " + error);
    });
}