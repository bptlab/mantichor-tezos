import BpmnModdle, { Definitions } from 'bpmn-moddle';
const moddle = new BpmnModdle();

/**
 * This function parses the BPMN XML format and returns a bpmn-moddle representation of the diagram.
 *
 * @param xml String containing the BPMN XML
 * @returns A promise resolving with the root `Definitions` instance contained in the file
 */
export function parseModdle(xml: string): Promise<Definitions> {
  return new Promise<Definitions>((resolve, reject) => {
    moddle.fromXML(xml, (err: any, definitions: Definitions) => {
      if (!err) {
        resolve(definitions);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Helper function to filter bpmn-moddle instances. For example, to check whether an element
 * is a gateway or an event:
 *
 * ```
 * is("bpmn:Gateway", "bpmn:Event")(element)
 * ```
 *
 * This format can be used in stream methods as well:
 *
 * ```
 * elements.filter(is("bpmn:Gateway", "bpmn:Event"))
 * ```
 *
 * @param types A list of BPMN types to check for
 */
export function is(...types: string[]) {
  return (element: any) => {
    return types.some((type) => element.$instanceOf(type));
  };
}
