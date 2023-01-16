

function handleMultArgs(msg, nodeId, inputList){
  
  // this.kati works as static variables. Because in js, functions are like classes (?)
  if (!('store' in this))
    this.store = {};
  
  if (!(nodeId in this.store))
    this.store[nodeId] = {};
    
  
  const topic = msg.topic;
  const value = msg.payload;
  
  if (this.store[nodeId][topic] !== undefined)
    console.error('at node ' + nodeId + ', topic ' + topic + ' already exists in this.store[nodeId]');
    
  this.store[nodeId][topic] = value;
  
  // Check if all fields are completed then return true to send the message
  for (let inp in inputList)
    if (this.store[nodeId][inp] === undefined)
      return false;
  
  return true;
}
