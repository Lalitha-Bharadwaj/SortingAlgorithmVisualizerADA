with Ada.Real_Time; use Ada.Real_Time;

package body Selection_Sort is

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

      if N > 1 then
         for I in 1 .. N - 1 loop
            declare
               Min_Idx : Positive := I;
            begin
               for J in I + 1 .. N loop
                  -- Compare J with current minimum
                  Add_Step (Compare, J - 1, Min_Idx - 1);
                  Result.Comparisons := Result.Comparisons + 1;
                  Result.Operations := Result.Operations + 1;

                  if Arr.Element (J) < Arr.Element (Min_Idx) then
                     Min_Idx := J;
                  end if;
               end loop;

               -- Swap if min index is not I
               if Min_Idx /= I then
                  declare
                     Temp : constant Integer := Arr.Element (I);
                  begin
                     Arr.Replace_Element (I, Arr.Element (Min_Idx));
                     Arr.Replace_Element (Min_Idx, Temp);
                  end;

                  Result.Swaps := Result.Swaps + 1;
                  Result.Operations := Result.Operations + 2; -- Two array writes

                  Add_Step (Swap, I - 1, Min_Idx - 1);
               end if;

               -- Index I is now sorted
               Add_Step (Sorted, I - 1, -1);
            end;
         end loop;
      end if;

      -- Final element is sorted
      if N > 0 then
         Add_Step (Sorted, N - 1, -1);
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

end Selection_Sort;
