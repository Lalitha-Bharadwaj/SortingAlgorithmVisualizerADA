with Ada.Real_Time; use Ada.Real_Time;

package body Bubble_Sort is

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
         for Outer in 1 .. N - 1 loop
            for Inner in 1 .. N - Outer loop
               -- Record comparison step (0-indexed)
               Add_Step (Compare, Inner - 1, Inner);
               Result.Comparisons := Result.Comparisons + 1;
               Result.Operations := Result.Operations + 1;

               if Arr.Element (Inner) > Arr.Element (Inner + 1) then
                  -- Swap elements
                  declare
                     Temp : constant Integer := Arr.Element (Inner);
                  begin
                     Arr.Replace_Element (Inner, Arr.Element (Inner + 1));
                     Arr.Replace_Element (Inner + 1, Temp);
                  end;

                  Result.Swaps := Result.Swaps + 1;
                  Result.Operations := Result.Operations + 2; -- Two array writes

                  -- Record swap step
                  Add_Step (Swap, Inner - 1, Inner);
               end if;
            end loop;

            -- The element at N - Outer + 1 is now sorted
            Add_Step (Sorted, N - Outer, -1);
         end loop;
      end if;

      -- Mark final remaining element (index 0) as sorted
      if N > 0 then
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

end Bubble_Sort;
