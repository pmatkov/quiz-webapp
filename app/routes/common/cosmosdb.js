
module.exports = async (db, collection, criteria) => {

    const data = await db.collection(collection).find(criteria).toArray();

    const transformedData = data.map(item => {
        const { _id, ...rest } = item;
        return { id: _id.toHexString(), ...rest };
    });
    
    return transformedData;
};
  