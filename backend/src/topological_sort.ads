with Ada.Strings.Unbounded; use Ada.Strings.Unbounded;
with Ada.Containers.Vectors;
with Sort_Types; use Sort_Types;

package Topological_Sort is

   package String_Vectors is new Ada.Containers.Vectors
     (Index_Type => Positive, Element_Type => Unbounded_String);

   type Edge_Type is record
      From_Node : Unbounded_String;
      To_Node   : Unbounded_String;
   end record;

   package Edge_Vectors is new Ada.Containers.Vectors
     (Index_Type => Positive, Element_Type => Edge_Type);

   type Graph_Step is record
      Step_Num     : Integer;
      Action       : Unbounded_String;
      Current_Node : Unbounded_String;
      Active_Edge  : Edge_Type;
      Queue        : String_Vectors.Vector;
      Node_Names   : String_Vectors.Vector;
      Indegrees    : Element_Vectors.Vector; -- matching Node_Names
      Processed    : String_Vectors.Vector;
   end record;

   package Graph_Step_Vectors is new Ada.Containers.Vectors
     (Index_Type => Positive, Element_Type => Graph_Step);

   type Topo_Result is record
      Cycles_Detected  : Boolean;
      Error_Message    : Unbounded_String;
      Trace            : Graph_Step_Vectors.Vector;
      Time_Ms          : Float;
      Operations_Count : Integer;
   end record;

   function Run_Topo_Sort (Nodes : String_Vectors.Vector; Edges : Edge_Vectors.Vector) return Topo_Result;
   function To_Json (Result : Topo_Result) return Unbounded_String;

end Topological_Sort;
