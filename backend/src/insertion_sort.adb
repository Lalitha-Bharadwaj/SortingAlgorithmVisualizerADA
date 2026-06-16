with Ada.Real_Time; use Ada.Real_Time;

package body Insertion_Sort is

   function Sort (Input_Arr : Element_Vectors.Vector) return Sort_Result is
      Start_Time  : constant Time := Clock;
      Result      : Sort_Result;
      Arr         : Element_Vectors.Vector := Input_Arr;
      N           : constant Natural := Natural (Arr.Length);
      Step_Count  : Integer := 0;

      procedure Add_Step (Action : Action_Kind; I, J : Integer) is
         Step : Trace_Step;
      begin
         Step_Count := Step_Count + 1;
         Step.Step_Num := Step_Count;
         Step.Action := Action;
         if I >= 0 then
            Step.Indices.Append (I);
         end if;
         if J >= 0 then
            Step.Indices.Append (J);
         end if;
         Step.Arr := Arr;
         Result.Trace.Append (Step);
      end Add_Step;

   begin
      Result.Comparisons := 0;
      Result.Swaps := 0;
      Result.Operations := 0;

      -- A single element array is already sorted
      if N > 1 then
         -- Mark first element as sorted initially
         Add_Step (Sorted, 0, -1);

         for I in 2 .. N loop
            declare
               Key : constant Integer := Arr.Element (I);
               J   : Integer := I - 1;
               Shifted : Boolean := False;
            begin
               -- Shift loop
               while J >= 1 loop
                  -- Record comparison of Arr(J) and Key
                  Add_Step (Compare, J - 1, J);
                  Result.Comparisons := Result.Comparisons + 1;
                  Result.Operations := Result.Operations + 1;

                  if Arr.Element (J) > Key then
                     -- Shift element right
                     Arr.Replace_Element (J + 1, Arr.Element (J));
                     Result.Operations := Result.Operations + 2; -- Read and Write
                     Shifted := True;

                     -- Record the shift set action
                     Add_Step (Set, J, J - 1);
                     J := J - 1;
                  else
                     exit;
                  end if;
               end loop;

               -- Insert the key back into its sorted position
               Arr.Replace_Element (J + 1, Key);
               Result.Operations := Result.Operations + 1; -- Write

               -- Record the insert set action
               Add_Step (Set, J, -1);

               -- Mark all elements up to I as sorted
               for K in 1 .. I loop
                  Add_Step (Sorted, K - 1, -1);
               end loop;
            end;
         end loop;
      elsif N = 1 then
         Add_Step (Sorted, 0, -1);
      end if;

      -- Record elapsed time
      declare
         Elapsed : constant Time_Span := Clock - Start_Time;
         Elapsed_Sec : constant Duration := To_Duration (Elapsed);
      begin
         Result.Time_Ms := Float (Elapsed_Sec) * 1000.0;
      end;

      return Result;
   end Sort;

end Insertion_Sort;
