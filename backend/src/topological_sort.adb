with Ada.Real_Time; use Ada.Real_Time;
with Ada.Strings.Fixed;

package body Topological_Sort is

   function Trim (S : String) return String is
   begin
      return Ada.Strings.Fixed.Trim (S, Ada.Strings.Both);
   end Trim;

   function Run_Topo_Sort (Nodes : String_Vectors.Vector; Edges : Edge_Vectors.Vector) return Topo_Result is
      Start_Time  : constant Time := Clock;
      Result      : Topo_Result;
      Step_Count  : Integer := 0;
      Ops         : Integer := 0;

      -- Current state variables
      Queue       : String_Vectors.Vector;
      Processed   : String_Vectors.Vector;
      Node_Names  : String_Vectors.Vector := Nodes;
      Indegrees   : Element_Vectors.Vector;

      procedure Add_Step (Action : String; Current : Unbounded_String; Active : Edge_Type) is
         Step : Graph_Step;
      begin
         Step_Count := Step_Count + 1;
         Step.Step_Num := Step_Count;
         Step.Action := To_Unbounded_String (Action);
         Step.Current_Node := Current;
         Step.Active_Edge := Active;
         Step.Queue := Queue;
         Step.Node_Names := Node_Names;
         Step.Indegrees := Indegrees;
         Step.Processed := Processed;
         Result.Trace.Append (Step);
      end Add_Step;

      function Get_Indegree (Node : Unbounded_String) return Integer is
      begin
         for K in 1 .. Integer (Node_Names.Length) loop
            if Node_Names.Element (K) = Node then
               return Indegrees.Element (K);
            end if;
         end loop;
         return 0;
      end Get_Indegree;

      procedure Set_Indegree (Node : Unbounded_String; Val : Integer) is
      begin
         for K in 1 .. Integer (Node_Names.Length) loop
            if Node_Names.Element (K) = Node then
               Indegrees.Replace_Element (K, Val);
               exit;
            end if;
         end loop;
      end Set_Indegree;

   begin
      Result.Cycles_Detected := False;
      Result.Error_Message := Null_Unbounded_String;
      Result.Operations_Count := 0;

      -- 1. Initialize indegrees to 0
      for Node of Node_Names loop
         Indegrees.Append (0);
         Ops := Ops + 1;
      end loop;

      -- 2. Compute indegrees based on edges
      for Edge of Edges loop
         declare
            Target : constant Unbounded_String := Edge.To_Node;
            Current_Ind : constant Integer := Get_Indegree (Target);
         begin
            Set_Indegree (Target, Current_Ind + 1);
            Ops := Ops + 2;
         end;
      end loop;

      -- Add initial state trace step
      Add_Step ("init", Null_Unbounded_String, (Null_Unbounded_String, Null_Unbounded_String));

      -- 3. Enqueue nodes with indegree = 0
      for Node of Node_Names loop
         if Get_Indegree (Node) = 0 then
            Queue.Append (Node);
            Ops := Ops + 1;
            Add_Step ("enqueue", Node, (Null_Unbounded_String, Null_Unbounded_String));
         end if;
      end loop;

      -- 4. Kahn's algorithm loop
      while not Queue.Is_Empty loop
         declare
            Curr : constant Unbounded_String := Queue.First_Element;
         begin
            Queue.Delete_First;
            Processed.Append (Curr);
            Ops := Ops + 2;

            Add_Step ("dequeue", Curr, (Null_Unbounded_String, Null_Unbounded_String));

            -- Find outgoing edges
            for Edge of Edges loop
               if Edge.From_Node = Curr then
                  declare
                     Neighbor : constant Unbounded_String := Edge.To_Node;
                     New_Ind  : constant Integer := Get_Indegree (Neighbor) - 1;
                  begin
                     Set_Indegree (Neighbor, New_Ind);
                     Ops := Ops + 2;

                     Add_Step ("update_indegree", Curr, Edge);

                     if New_Ind = 0 then
                        Queue.Append (Neighbor);
                        Ops := Ops + 1;
                        Add_Step ("enqueue", Neighbor, (Null_Unbounded_String, Null_Unbounded_String));
                     end if;
                  end;
               end if;
            end loop;
         end;
      end loop;

      -- 5. Detect cycles
      if Integer (Processed.Length) < Integer (Nodes.Length) then
         Result.Cycles_Detected := True;
         Result.Error_Message := To_Unbounded_String ("Cycle detected in graph! Topological sort is only defined for Directed Acyclic Graphs (DAGs).");
         Add_Step ("cycle", Null_Unbounded_String, (Null_Unbounded_String, Null_Unbounded_String));
      end if;

      Result.Operations_Count := Ops;

      -- Record time
      declare
         Elapsed : constant Time_Span := Clock - Start_Time;
         Elapsed_Sec : constant Duration := To_Duration (Elapsed);
      begin
         Result.Time_Ms := Float (Elapsed_Sec) * 1000.0;
      end;

      return Result;
   end Run_Topo_Sort;

   function To_Json (Result : Topo_Result) return Unbounded_String is
      Output : Unbounded_String;
      First : Boolean;
   begin
      Output := To_Unbounded_String ("{");
      Append (Output, """cyclesDetected"":" & (if Result.Cycles_Detected then "true" else "false") & ",");
      Append (Output, """errorMessage"":""" & To_String (Result.Error_Message) & """,");
      Append (Output, """executionTime"":" & Trim (Float'Image (Result.Time_Ms)) & ",");
      Append (Output, """operationsCount"":" & Trim (Integer'Image (Result.Operations_Count)) & ",");
      Append (Output, """trace"":[");

      First := True;
      for Step of Result.Trace loop
         if not First then
            Append (Output, ",");
         end if;

         Append (Output, "{""step"":" & Trim (Integer'Image (Step.Step_Num)) & ",");
         Append (Output, """action"":""" & To_String (Step.Action) & """,");
         Append (Output, """currentNode"":""" & To_String (Step.Current_Node) & """,");
         
         Append (Output, """activeEdge"":{");
         Append (Output, """from"":""" & To_String (Step.Active_Edge.From_Node) & """,");
         Append (Output, """to"":""" & To_String (Step.Active_Edge.To_Node) & """},");

         -- Queue array
         Append (Output, """queue"":[");
         declare
            Q_First : Boolean := True;
         begin
            for Node of Step.Queue loop
               if not Q_First then
                  Append (Output, ",");
               end if;
               Append (Output, """" & To_String (Node) & """");
               Q_First := False;
            end loop;
         end;
         Append (Output, "],");

         -- Processed array
         Append (Output, """processed"":[");
         declare
            P_First : Boolean := True;
         begin
            for Node of Step.Processed loop
               if not P_First then
                  Append (Output, ",");
               end if;
               Append (Output, """" & To_String (Node) & """");
               P_First := False;
            end loop;
         end;
         Append (Output, "],");

         -- Indegrees object
         Append (Output, """indegrees"":{");
         declare
            Ind_First : Boolean := True;
         begin
            for K in 1 .. Integer (Step.Node_Names.Length) loop
               if not Ind_First then
                  Append (Output, ",");
               end if;
               Append (Output, """" & To_String (Step.Node_Names.Element (K)) & """:" & Trim (Integer'Image (Step.Indegrees.Element (K))));
               Ind_First := False;
            end loop;
         end;
         Append (Output, "}");

         Append (Output, "}");
         First := False;
      end loop;

      Append (Output, "]}");
      return Output;
   end To_Json;

end Topological_Sort;
