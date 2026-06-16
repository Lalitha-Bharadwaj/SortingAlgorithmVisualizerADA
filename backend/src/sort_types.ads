with Ada.Containers.Vectors;
with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;

package Sort_Types is

   type Action_Kind is (Compare, Swap, Set, Pivot, Merge, Sorted);

   package Index_Vectors is new Ada.Containers.Vectors
     (Index_Type => Positive, Element_Type => Integer);

   package Element_Vectors is new Ada.Containers.Vectors
     (Index_Type => Positive, Element_Type => Integer);

   type Trace_Step is record
      Step_Num : Integer;
      Action   : Action_Kind;
      Indices  : Index_Vectors.Vector;
      Arr      : Element_Vectors.Vector;
   end record;

   package Trace_Vectors is new Ada.Containers.Vectors
     (Index_Type => Positive, Element_Type => Trace_Step);

   type Sort_Result is record
      Comparisons : Integer;
      Swaps       : Integer;
      Operations  : Integer;
      Time_Ms     : Float;
      Trace       : Trace_Vectors.Vector;
   end record;

   function To_Json (Step : Trace_Step) return Unbounded_String;
   function To_Json (Result : Sort_Result; Algo_Name : String) return Unbounded_String;

end Sort_Types;
